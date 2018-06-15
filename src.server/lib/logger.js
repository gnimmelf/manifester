const {
  format,
  transports,
  createLogger,
} = require("winston");

const level = process.env.LOG_LEVEL || 'debug';


format.combine(
  format.colorize(),
  format.json()
);

const logger = createLogger({
    transports: [
        new transports.Console({
            level: level,
            timestamp: function () {
                return (new Date()).toISOString();
            }
        })
    ]
});

logger.emitErrs = false;

module.exports = logger