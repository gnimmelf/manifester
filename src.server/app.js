require('source-map-support').install();
require('babel-polyfill');

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const storage = require('node-persist');
// Helpers
const upquire = require('upquire');
const upquire_path = function(some_path) { return upquire(some_path, { pathOnly: true, dirname: true }) }
// Package settings
const settings = require('../package.json').settings;

// Routes
const index = require('./routes/index');
const documents = require('./routes/graphql/documents').default;

// Express app
const app = express();

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
app.use('/graphql', documents);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
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
