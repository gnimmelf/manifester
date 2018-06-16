const debug = require('debug')('mf:sendApiResponse');
const RESTfulError = require('../lib/RESTfulError');

module.exports = (expressResponseObj, payload) =>
{
  debug('> payload', payload);

  let apiPayload, status=200;

  if (payload instanceof Error) {


    status = isNaN(payload.code) ? 500 : payload.code;

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