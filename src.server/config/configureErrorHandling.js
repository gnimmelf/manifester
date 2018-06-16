const {
  sendApiResponse,
  getRequestFullUrl,
} = require('../utils');

module.exports = (mainApp) => {


  // Catch 404 and forward to error handler
  mainApp.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.code = 404;
    next(err);
  });

  // API-error: JSON-response
  mainApp.use('/api', function(err, req, res, next) {
    if (err.code >= 500 && mainApp.checkEnv('dev')) {
      console.error(err)
    }
    err.data = getRequestFullUrl(req);
    sendApiResponse(res, err);
  });

  // Non-API-error: HTML-response
  mainApp.use(function(err, req, res, next) {
    if (err.code >= 500 && mainApp.checkEnv('dev')) {
      console.error(err)
    }

    const statusCode = err.code || 500;

    res.status(statusCode);

    res.locals.error  = {
      message: err.message,
      statusCode: statusCode,
    };

    if (req.mainApp.get('env') !== 'production') {
      // Show stack
      res.locals.error.stack = err.stack;
    }

    res.render('error');
  });

}