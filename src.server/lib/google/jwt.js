import _debug from 'debug';
import {
  TokenCache,
  requestWithJWT
} from 'google-oauth-jwt';

const debug = _debug('lib:google:jwt');

export const makeJwtRequest = (jwt) => {
  let request = requestWithJWT();

  return (url, raw_body=false) => {

    debug('Requesting %s', url)

    return new Promise((resolve, reject) => {
      request(
        { url: url, jwt: jwt },
        (err, res, body) => {
          if(err) {
            reject(err)
          }
          else {
            debug(url, raw_body, body)
            resolve(raw_body ? body : JSON.parse(body));
          }
        }
      );
    })

  }
};
