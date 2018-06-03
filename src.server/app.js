const debug = require('debug')('mf:app');

const express = require('express');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
var cors = require('cors');

const { scopePerRequest } = require('awilix-express');

const { urlencoded, json } = require('body-parser');
const { join } = require('path');

const {
  configureContainer,
  inspect,
  sendApiResponse,
} = require('./lib');

// Main Express app
const app = express();
// Exportable Express app for local development of the "head" in "headless"
app.localApp = express();


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
 * Cors
 * NOTE! The manifested `localApp` must set it's own CORS when in production (see `../index.js`)
 */
if (app.get('env') !== 'production') {
  app.use(cors({
    origin: true,
    credentials: true,
  }));
}

/**
 * Standard middleware
 */

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * Middleware
 */

app.use(scopePerRequest(container));
app.use(require('./middleware/authenticateHeaderToken'));


/**
 * Routes
 */

app.use('/api/site', require('./routes/api.site'));
app.use('/api/auth', require('./routes/api.authenticate'));
app.use('/api/user', require('./routes/api.user'));
app.use('/api/schemas', require('./routes/api.schemas'));
app.use('/api/data', require('./routes/api.data'));
app.use(app.localApp)

/**
 * Favicon: uncomment after placing your favicon in... TODO! Where? -Should prefer `app.localApp`...
 */
//app.use(favicon(join("public", 'favicon.ico')));


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
  if (req.app.get('env') !== 'production' && err.code >= 500) {
    console.error(err)
  }

  err.data = req.protocol + '://' + req.get('host') + req.originalUrl;
  sendApiResponse(res, err);
});

// Non-API-error: HTML-response
app.use(function(err, req, res, next) {
  if (req.app.get('env') !== 'production') {
    console.error(err)
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
