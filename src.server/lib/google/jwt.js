import _debug from 'debug';
import { requestWithJWT } from 'google-oauth-jwt';

const debug = _debug('lib:google:jwt');

export const makeJwtRequest = (jwt) =>
{
  let request = requestWithJWT();

  return (params={}, options={}) =>
  {
    let raw_body = (options.raw_body && true) || false;

    // Ensure params is object
    if (typeof params == 'string') params = { url: params }
    params.jwt = jwt;

    debug('Requesting %s', params.url)

    return new Promise((resolve, reject) =>
    {
      request(params,
        (err, res, body) =>
        {
          if(err)
          {
            reject(err)
          }
          else
          {
            debug(params.url, raw_body, body)
            resolve(raw_body ? body : JSON.parse(body));
          }
        }
      );
    })

  }
};
