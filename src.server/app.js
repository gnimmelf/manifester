var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var storage = require('node-persist');
// Helpers
var upquire = require('upquire');
var upquire_path = function(folder_path) { return upquire(folder_path, { pathOnly: true }) }
// Package settings
var settings = require('../package.json').settings;
// Routes
var index = require('./routes/index');

var app = express();

// view engine setup
app.set('views', upquire_path('/src.server/views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(settings.url_dist_client, express.static(upquire_path(settings.dir_dist_client)));
app.use(settings.url_src_client, express.static(upquire_path(settings.dir_src_client)));
app.use(express.static(upquire_path('/public')));


app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
