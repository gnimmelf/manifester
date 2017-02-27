import _debug from 'debug';
import { requestWithJWT } from 'google-oauth-jwt';
import upquire from 'upquire';

import requestDebug from 'request-debug';
import globToRegExp from 'glob-to-regexp';

const debug = _debug('lib:g-drive:jwt');

export const makeJwtRequest = (jwt, request_debug=false) =>
{
  let request = requestWithJWT();

  if (request_debug) requestDebug(request)

  return (params={}) =>
  {
    // Ensure params is object
    if (typeof params == 'string') params = { url: params }

    params.jwt = jwt;
    params.json = (params.json ? params.json
                               : true);

    debug('Requesting %s', params.url, params)

    return new Promise((resolve, reject) =>
    {
      request(params,
        (err, res, body) =>
        {
          if(err) {
            reject(err)
          }
          else {
            debug(params.url, body)
            resolve(params.json ? body : JSON.parse(body));
          }
        }
      );
    })

  }
};

const GSA = upquire('/sensitive/g_service_account.json');

export const jwtRequest = makeJwtRequest({
  email: GSA.client_email,
  key: GSA.private_key,
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
}, globToRegExp(process.env.DEBUG || '').test('jwt-request'));

