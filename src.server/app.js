require('source-map-support').install();
require('babel-polyfill');

const debug = require('debug')('app')
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const jsend = require('jsend');

const upquirePath = require('./lib/utils').upquirePath

// Package settings
const settings = require('../package.json').settings;

// Express app
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Allow cors for ALL domains!
app.use(cors()); // TODO! Change for `prod`

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(`/${settings.url_dist_client}`, express.static(upquirePath(settings.dir_dist_client)));
app.use(`/${settings.url_src_client}`, express.static(upquirePath(settings.dir_src_client)));
app.use(express.static(upquirePath(settings.dir_public)));

debug('static', `/${settings.url_dist_client} =>`, upquirePath(settings.dir_dist_client))
debug('static', `/${settings.url_src_client} =>`, upquirePath(settings.dir_src_client))
debug('static', '/ =>', upquirePath(settings.dir_src_client))

/**
 * Routes
 */

const index = require('./routes/index');
app.use('/', index);

/**
 * Errorhandling
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
