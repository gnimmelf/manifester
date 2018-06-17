const assert = require('assert');
const { join } = require('path');
const morgan = require('morgan');
const mkdirp = require('mkdirp').sync;
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
  loglevel='debug',
}={}) => {

  assert(app, 'required!')

  mkdirp(logFileDir);

  const logFilePath = join(logFileDir, 'app.log');


  /**
   * Winston
   */

  loggers.add('default', createLogger({
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.colorize({ all: true }),
      format.json(),
      format.printf(({level, timestamp, message, ...data}) => {
        return `${timestamp} [${level}] ${message} ${Object.keys(data).length ? JSON.stringify(data) : ''}`
      }),
    ),
    transports: [
      new transports.Console({
        level: loglevel,
        handleExceptions: true,
        colorize: true,
      }),
      new transports.File({
        level: loglevel,
        filename: logFilePath,
        handleExceptions: true,
        maxsize: 5 * 1024 * 1024, // 5MB
        maxFiles: 5,
        colorize: false,
      }),
    ],
    exitOnError: false,
    emitErrors: false,
  }));


  /**
   * Morgan
   */
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

  // Standard config return, a list of [k,v] tuples
  return [
    ['logFilePath', logFilePath],
    ['loglevel', loglevel],
    ['morganProfile', morganProfile],
  ];
}