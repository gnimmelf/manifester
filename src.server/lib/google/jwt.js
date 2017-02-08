import {
  TokenCache,
  requestWithJWT
} from 'google-oauth-jwt';


export const makeJwtRequest = (jwt) => {
  let request = requestWithJWT();
  return (url, raw_body=false) => {

    return new Promise((resolve, reject) => {
      request(
        { url: url, jwt: jwt },
        (err, res, body) => { err ? reject(err) : resolve(raw_body ? body : JSON.parse(body)); }
      );
    })

  }
};
