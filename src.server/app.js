const debug = require('debug')('mf:app');

const assert = require('assert');
const express = require('express');
const morgan = require('morgan');
const listEndpoints = require('express-list-endpoints')
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { scopePerRequest } = require('awilix-express');

const { urlencoded, json } = require('body-parser');
const { join } = require('path');

const {
  configureContainer,
  inspect,
  sendApiResponse,
  logger,
} = require('./lib');

// Main Express app
const app = express();
// Exportable Express app for local development of the "head" in "headless"
app.localApp = express();


/**
 * `NODE_ENV`
 */

const NODE_ENV = (process.env.NODE_ENV || 'development');
const ALLOWED_NODE_ENVS = ['production', 'development', 'test']

app.checkEnv = (needle=NODE_ENV) => ALLOWED_NODE_ENVS.find(straw => {
  return needle.toLowerCase() == straw.substr(0, needle.length);
});

assert(app.checkEnv(NODE_ENV), `'NODE_ENV' must be one of ${ALLOWED_NODE_ENVS} when specified! -Defaults to 'development'`);

console.log('NODE_ENV', app.checkEnv());


/**
 *  View engine setup
 * -Yes, pug/jade. Tried "all" others, they suck and really hamper coding effiency.
 */

app.set('views', join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('json spaces', 2);


/**
 * App setup (`awilix`-container)
 */

const container = configureContainer(app, __dirname);
app.set('container', container);


/**
 * Standard middleware
 */

// CORS
// NOTE! The manifested `localApp` must set it's own CORS when in production (see `../index.js`)
if (!app.checkEnv('production')) {
  app.use(cors({
    origin: true,
    credentials: true,
  }));
}

// Logging
const morganProfile = 'dev';
app.use(morgan(morganProfile, {
    skip: function (req, res) {
        return res.statusCode < 400
    },
    stream: process.stderr,
}));

app.use(morgan(morganProfile, {
    skip: function (req, res) {
        return res.statusCode >= 400
    },
    stream: process.stdout,
}));

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

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.code = 404;
  next(err);
});

// API-error: JSON-response
app.use('/api', function(err, req, res, next) {
  if (err.code >= 500) {
    logger.error(err)
  }

  err.data = req.protocol + '://' + req.get('host') + req.originalUrl;
  sendApiResponse(res, err);
});

// Non-API-error: HTML-response
app.use(function(err, req, res, next) {
  if (app.checkEnv('production')) {
    logger.error(err)
  }

  const statusCode = err.code || 500;

  res.status(statusCode);

  res.locals.error  = {
    message: err.message,
    statusCode: statusCode,
  };

  if (req.app.get('env') !== 'production') {
    // Show stack
    res.locals.error.stack = err.stack;
  }

  res.render('error');
});

module.exports = app;
