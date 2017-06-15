const debug = require('debug')('app')
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jsend = require('jsend');

const upquirePath = require('./lib/utils').upquirePath;

const pathMaps = require('../package.json').appSettings.pathMaps;

// Express app
const app = express();

// Exportable Express app for custom development of the "head in headless".
app.customApp = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Jsend middleware
app.use(jsend.middleware);

// Uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Static folders
Object.values(pathMaps).forEach(map => {
  const url = path.join('/', map.url);
  const dir = upquirePath(map.dir);
  app.use(url, express.static(dir));
  debug('path-mappings', url, '=>', dir);
})

/*
  Routes
*/
const authorize = require('./lib/middleware/authorize');

app.use('/admin', require('./routes/index'));
app.use('/api/auth', require('./routes/authenticate'));
app.use('/api/schemas', require('./routes/schemas'));
app.use('/api', authorize, (req, res, next) => { res.jsen.success() });
app.use(app.customApp)
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
