const debug = require('debug')('app');

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


const pathMaps = require('../package.json').appSettings.pathMaps;


// Main Express app
const app = express();

// Exportable Express app for local development of the "head" in "headless"
app.localApp = express();

// Configure `awilix` service-container
const container = configureContainer(app, join(__dirname, 'lib'));

/**
 * App setup
 */


app.set('container', container);

/**
 *  View engine setup
 */
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('json spaces', 2);

// Register `HandlebardFormHelpers` onto Handlebars (`hbs`)
require('handlebars-form-helpers').register(require('hbs').handlebars);




app.get.toString()

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
Object.values(pathMaps).forEach(map => {
  const url = join('/', map.url);
  const dir = upquirePath(map.dir);
  app.use(url, express.static(dir));
  debug('path-mappings', url, '=>', dir);
})


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
//app.use('/admin', require('./routes/admin'));
app.use('/login', require('./routes/login'));
app.use(app.localApp)


/**
 * Favicon: uncomment after placing your favicon in... TODO! Where? -Should prefer `app.localApp`...
 */
//app.use(favicon(join(pathMaps.public.dir, 'favicon.ico')));


/**
 * Downstream errorhandling
 */

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.code = 404;
  next(err);
});


// 500 API-error: JSON-response
app.use('/api', function(err, req, res, next) {
  err.data = req.protocol + '://' + req.get('host') + req.originalUrl;
  sendApiResponse(res, err);
});


// Non-API-error: HTML-response
app.use(function(err, req, res, next) {
  res.status(err.code || 500);
  // set locals, only providing error in development
  if (req.app.get('env') !== 'development') {
    console.log(err)
    res.locals.message = res.status;
    res.locals.error = err.message;
  }
  else {
    res.locals.message = err.message;
    res.locals.error = err;
  }

  res.render('error');
});

module.exports = app;
