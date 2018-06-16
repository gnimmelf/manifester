const morgan = require('morgan');
const appRoot = require('app-root-path');
const {
  format,
  transports,
  createLogger,
} = require("winston");

const loggers = require('../lib/loggers');

module.exports = (mainApp) => {

  // Winston
  level = process.env.LOG_LEVEL || 'debug'

  console.log('Log level:', level);

  loggers.add('default', createLogger({
    format: format.combine(
      format.colorize(),
      format.splat(),
      format.simple(),
    ),
    transports: [
      new transports.File({
        level: level,
        filename: `${appRoot.path}/logs/app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
      }),
      new transports.Console({
        level: level,
        handleExceptions: true,
        json: false,
        colorize: true,
      })
    ],
    exitOnError: false,
    emitErrors: false,
  }));

  // Morgan
  const morganProfile = 'dev';
  mainApp.use(morgan(morganProfile, {
      skip: function (req, res) {
          return res.statusCode < 400
      },
      stream: process.stderr,
  }));

  mainApp.use(morgan(morganProfile, {
      skip: function (req, res) {
          return res.statusCode >= 400
      },
      stream: process.stdout,
  }));


  return loggers;
}