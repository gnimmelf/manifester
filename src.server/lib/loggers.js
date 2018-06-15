const assert = require('assert');
const loggers = {}

exports.add = (name, logger) => {
  assert(!loggers[name], 'Logger allready registered by name: '+name);

  console.log('adding logger', name)

  loggers[name] = logger;
  return logger;
};

exports.get = (name) => {
  assert(loggers[name], 'Unknown logger: '+name);
  return loggers[name];
}

exports.list = () => Object.keys(loggers);
