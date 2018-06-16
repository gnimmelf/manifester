const debug = require('debug')('mf:app');

const { join } = require('path');
const assert = require('assert');
const express = require('express');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { urlencoded, json } = require('body-parser');
const { scopePerRequest } = require('awilix-express');

const {
  configureContainer,
  configureNodeEnv,
  configureLogging,
  configureErrorHandling,
} = require('./config');

/**
 * Express apps
 */

const app = express();
app.localApp = express(); // Exportable Express app for local development of the "head" in "headless"

/**
 * Configurations
 */

// Node-env, set returned env-checker on app
app.checkEnv = configureNodeEnv(['production', 'development', 'test']);

// Loggers, grab the default logger for use here
const logger = configureLogging(app).get('default');

// Awilix-container, set on `app`
const container = configureContainer(app, __dirname);
app.set('container', container)

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
if (!app.checkEnv('production')) {
  const options = {
    origin: true,
    credentials: true,
  };
  console.log('CORS', options)
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

app.use(scopePerRequest(container));
app.use(require('./middleware/authenticateHeaderToken'));


/**
 * Routes
 */

app.use('/api', require('./routes/api.inspect'));
app.use('/api/auth', require('./routes/api.authenticate'));
app.use('/api/schema', require('./routes/api.schema'));
app.use('/api/user', require('./routes/api.user'));
app.use('/api/data', require('./routes/api.data'));
app.use(app.localApp)


/**
 * Downstream errorhandling
 */

configureErrorHandling(app)

module.exports = app;
