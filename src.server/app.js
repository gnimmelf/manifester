const debug = require('debug')('mf:app');

const express = require('express');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');

const { scopePerRequest } = require('awilix-express');
const { urlencoded, json } = require('body-parser');
const { join } = require('path');

const {
  upquirePath,
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
 */
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('json spaces', 2);


/**
 * App setup
 */
const container = configureContainer(app, join(__dirname, 'lib'));
app.set('container', container);



// Register `HandlebardFormHelpers` onto Handlebars (`hbs`)
require('handlebars-form-helpers').register(require('hbs').handlebars);


/**
 * Standard middleware
 */

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());


/**
 * Static folders
 */
app.use("/public", express.static(join("../", __dirname, "public")));

/**
 * Middleware
 */
app.use(scopePerRequest(container));
app.use(require('./lib/middleware/authenticateHeaderToken'));


/**
 * Routes
 */

app.use('/api/auth', require('./routes/authenticate'));
app.use('/api/schemas', require('./routes/schemas'));
app.use('/admin', require('./routes/admin'));
app.use('/login', require('./routes/login'));
app.use(app.localApp)

/**
 * Favicon: uncomment after placing your favicon in... TODO! Where? -Should prefer `app.localApp`...
 */
//app.use(favicon(join(pathMaps.public.dir, 'favicon.ico')));


/**
 * Downstream errorhandling
 */

// API-error: JSON-response
app.use('/api', function(err, req, res, next) {
  err.data = req.protocol + '://' + req.get('host') + req.originalUrl;
  sendApiResponse(res, err);
});


// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.code = 404;
  next(err);
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
