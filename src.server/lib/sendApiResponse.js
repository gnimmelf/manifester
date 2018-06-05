const debug = require('debug')('mf:sendApiResponse');
const RESTfulError = require('./RESTfulError');
const { isObject } = require('./utils');

module.exports = (expressResponseObj, payload) =>
{
  debug('> payload', payload);

  let apiPayload, status=200;

  if (payload instanceof Error) {


    status = isNaN(payload.code) ? 500 : payload.code;

    if (status >= 500) {
      // TODO! Use `morgan` logger to log error?
      console.error(payload);
    }

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