const assert = require('assert');
const { join } = require('path');
const morgan = require('morgan');
const {
  format,
  transports,
  createLogger,
} = require("winston");

/**
 * NOTE! We're not adding loggers to `winston`, but a custom `loggers` module
 * - Because `winston.loggers.add` does only accepts a configuration-object, not an instance,
 *   and that is a bad choice...
 */
const { loggers } = require('../utils');


module.exports = (app, {
  logFileDir=join(__localAppRoot, '/logs/'),
  defaultLogLevel='debug',
}={}) => {

  assert(app, 'required!')

  const LOG_FILE_PATH = join(logFileDir, 'app.log');

  // Winston
  level = process.env.LOG_LEVEL || defaultLogLevel;

  console.log(`Log level: ${level}`);
  console.log(`Logfile: ${LOG_FILE_PATH}`);

  loggers.add('default', createLogger({
    format: format.combine(
      format.colorize(),
      format.splat(),
      format.simple(),
    ),
    transports: [
      new transports.File({
        level: level,
        filename: LOG_FILE_PATH,
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
  app.use(morgan(morganProfile, {
      skip: function (req, res) {
          return res.statusCode < 400
      },
      stream: process.stderr,
  }));

  app.use(morgan(morganProfile, {
      skip: function (req, res) {
          return res.statusCode >= 400
      },
      stream: process.stdout,
  }));


  return loggers;
}