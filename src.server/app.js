const debug = require('debug')('mf:app');

const { join } = require('path');
const assert = require('assert');
const express = require('express');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { urlencoded, json } = require('body-parser');

const {
  configureAppEnv,
  configureLogging,
  configureContainer,
  configureErrorHandling,
} = require('./config');

const { loggers } = require('./utils')

/**
 * Express apps
 */

const app = express();
app.localApp = express(); // The Express app for local development of the "head" in "headless"

/**
 * Configurations
 */

const configLogs = {}; // For logging

// Node-env, INCLUDING GLOBALS!!
configLogs['env'] = configureAppEnv(app, {
  defaultEnv: 'development',
});

// Loggers
configLogs['logging'] = configureLogging(app, {
  logLevel: process.env.LOG_LEVEL || 'default',
});

// Awilix-container, set on `app`
configLogs['container'] = configureContainer(app, {
  servicesDir: join(__dirname, 'services')
});

/**
 * Log configs
 */

const logger = loggers.get('default');

Object.entries(configLogs).forEach(([category, configTuples]) => configTuples.forEach(([key, value]) => {
  logger.verbose(`(${category.toUpperCase()}) ${key} = ${value}`);
}));

/**
 * View engine setup
 * -Yes, pug/jade. Tried "all" others, they suck and really hamper coding effiency.
 */

app.set('views', join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('json spaces', 2);


/**
 * Standard middleware
 */

// CORS
// NOTE! The manifested `localApp` must set it's own CORS when in production (see `../index.js`)
if (__getEnv('production')) {
  const options = {
    origin: true,
    credentials: true,
  };
  logger.info('CORS', options)
  app.use(cors(options));
}

// Encoding
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

// TODO! Favicon: uncomment after placing your favicon... where? -Should prefer `app.localApp`...
//app.use(favicon(join("public", 'favicon.ico')));


/**
 * Custom middleware
 */

app.use(require('./middleware/authenticateHeaderToken'));


/**
 * Routes
 */

app.use('/api', require('./routes/api.inspect'));
app.use('/api/auth', require('./routes/api.authenticate'));
app.use('/api/schema', require('./routes/api.schema'));
app.use('/api/user', require('./routes/api.user'));
app.use('/api/data', require('./routes/api.data'));
app.use(app.localApp); // Mount the `localApp` last, so that all its routes apply


/**
 * Downstream errorhandling
 */

configureErrorHandling(app)

module.exports = app;
