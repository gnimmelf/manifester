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

// Jsend middleware
app.use(jsend.middleware);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(`/${settings.urlDistClient}`, express.static(upquirePath(settings.dirDistClient)));
app.use(`/${settings.urlSrcClient}`, express.static(upquirePath(settings.dirSrcClient)));
app.use(express.static(upquirePath(settings.dirPublic)));

debug('static', `/${settings.urlDistClient} =>`, upquirePath(settings.dirDistClient))
debug('static', `/${settings.urlSrcClient} =>`, upquirePath(settings.dirSrcClient))
debug('static', '/ =>', upquirePath(settings.dirSrcClient))

/*
  Routes
*/
const authorize = require('./routes/authenticate/authorize');

app.use('/', require('./routes/index'));
app.use('/api/auth', require('./routes/authenticate'));
app.use('/api/schemas', require('./routes/schemas'));
app.use('/api', authorize, (req, res, next) => { res.jsen.success() });

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
