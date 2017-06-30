const debug = require('debug')('app');

const express = require('express');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const jsend = require('jsend')({ strict: true });

const { scopePerRequest } = require('awilix-express');
const { urlencoded, json } = require('body-parser');
const { join } = require('path');

const { upquirePath, makeSingleInvoker } = require('./lib/utils');
const configureContainer = require('./lib/configureContainer');

const pathMaps = require('../package.json').appSettings.pathMaps;


// Express app
const app = express();
const container = configureContainer(join(__dirname, 'lib'));

/**
 * App setup
 */

// Exportable Express app for local development of the "head" in "headless"
app.localApp = express();

app.set('container', container);
// View engine setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('json spaces', 2);


/**
 * Standard middleware
 */

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());


// Static folders
Object.values(pathMaps).forEach(map => {
  const url = join('/', map.url);
  const dir = upquirePath(map.dir);
  app.use(url, express.static(dir));
  debug('path-mappings', url, '=>', dir);
})

// Favicon: uncomment after placing your favicon in
//app.use(favicon(join(pathMaps.public.dir, 'favicon.ico')));


/**
 * Middleware
 */
app.use(jsend.middleware);
app.use(scopePerRequest(container));
app.use(makeSingleInvoker(require('./lib/middleware/authenticateHeaderToken')));
app.use('/api/auth', require('./routes/authenticate'));

/*
  Routes
*/

app.use(app.localApp)

/*
  Errorhandling
*/

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  next(err);
});


// Error handlers
app.use('/api', function(err, req, res, next) {
  console.log(err)
  err.code = err.status;
  err.data = req.protocol + '://' + req.get('host') + req.originalUrl;
  res.jsend.error(err);
})


app.use(function(err, req, res, next) {

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
