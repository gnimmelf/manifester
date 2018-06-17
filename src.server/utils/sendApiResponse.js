const debug = require('debug')('mf:sendApiResponse');
const RESTfulError = require('../lib/RESTfulError');

const loggers = require('./loggers');

debug('loggers', loggers);

module.exports = (expressResponseObj, payload) =>
{
  debug('> payload', payload);

  const logger = loggers.get('default');

  let apiPayload, status=200;

  if (payload instanceof Error) {


    status = isNaN(payload.code) ? 500 : payload.code;

    if (!(payload instanceof RESTfulError) && RESTfulError.getByTypeOrCode(payload.code)) {
      // Make it a `RESTfulError`
      payload = new RESTfulError(payload.code, payload.message);
      debug('RESTfulError', RESTfulError)
    }

    if (err.code >= 500 && __getEnv('development')) {
      logger.error(err)
    }

    // Set the payload
    apiPayload = {
      msg: payload.message || '',
      data: payload.data || false,
    };
  }
  else {
    apiPayload = typeof payload == 'string' ? {
      msg: payload,
      data: undefined,
    } : payload || {};
  }

  debug(`> apiPayload: ${status}`, apiPayload);

  expressResponseObj.status(status).json(apiPayload);
}