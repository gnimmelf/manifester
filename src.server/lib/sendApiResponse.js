const debug = require('debug')('lib:sendApiResponse');
const RESTfulError = require('./RESTfulError');
const { isObject } = require('./utils');

module.exports = (expresspayloadObj, payload) =>
{
  debug('> payload', payload);

  let apiPayload, status=200;

  if (payload instanceof Error) {

    status = payload.code || 500;

    if (!(payload instanceof RESTfulError) && RESTfulError.getByTypeOrCode(payload.code)) {
      // Make it a `RESTfulError`
      payload = new RESTfulError(payload.code, payload.message);
      debug('RESTfulError', RESTfulError)
    }

    // Set the payload
    apiPayload = {
      msg: payload.message || '',
      data: payload.data || false,
    };
    // TODO! Use `morgan` logger to log error?
  }
  else {
    apiPayload = payload || {};
  }

  debug(`> apiPayload:${status}`, apiPayload);

  expresspayloadObj.status(status).json(apiPayload);
}