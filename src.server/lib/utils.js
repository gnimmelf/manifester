const path = require('path');
const join = path.join;
const jsend = require('jsend')({ strict: false });

const upquire = exports.upquire = require('upquire');
const RESTfulError = require('./RESTfulError');
const { inspect } = require('util');

exports.inspect = (obj) => console.log(inspect(obj, {colors: true, depth: 5}));

exports.upquire = upquire;

exports.upquirePath = function(some_path, ...rest)
// Find `some_path` somewhere in parent folder structure and resolve it.
{
  let full_path = upquire(some_path, { pathOnly: true, dirnameOnly: true });
  if (rest) {
    full_path = join.apply(join, [full_path].concat( rest ));
  }
  return full_path;
}

exports.requestFullUrl = (expressRequestObj) =>
{
  const req = expressRequestObj;
  const secure = req.connection.encrypted || req.headers['x-forwarded-proto'] === 'https'
  return `http${(secure ? 's' : '')}://${req.headers.host}${req.originalUrl}`;
};


exports.addFileExt = (path, ext=".json") => path.endsWith(ext) ? path : `${path}.json`;


exports.sendApiResponse = (expressResponseObj, response) =>
// Send `response` as jSend via `expressResponseObj`
{
  let method = 'success';
  let apiResponse;

  if (response instanceof Error) {

    let data;

    if (!(response instanceof RESTfulError) && RESTfulError.getByTypeOrCode(response.code)) {
      // Make it a `RESTfulError`
      data = response.data;
      response = new RESTfulError(response.code, response.message)
    }
    else {
      response.code = 500;
    }


    method = response.code < 500 ? 'fail' : 'error';
    apiResponse = {
      code: response.code,
      name: response.name,
      message: response.message || '',
    };
    if (apiResponse.name.toLowerCase() === apiResponse.message.toLowerCase() && data) {
      apiResponse.message = data.toString();
    }



    // TODO! Use `morgan` logger?
    console.error('sendApiResponse', apiResponse||response);
  }
  expressResponseObj.json(jsend[method](apiResponse||response));
}


exports.maybeThrow = (predicate, message, RestErrorTypeOrCode) =>
{
  if (predicate) {
    if (RestErrorTypeOrCode && RESTfulError.getByTypeOrCode(RestErrorTypeOrCode)) {
      throw new RESTfulError(RestErrorTypeOrCode, message);
    }
    else if (message) {
      throw new Error(message);
    }
    else if (predicate instanceof Error) {
      throw predicate;
    }
  }
}


exports.httpGet = (url) =>
// https://www.tomas-dvorak.cz/posts/nodejs-request-without-dependencies/
{
  return new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const lib = url.startsWith('https') ? require('https') : require('http');
    const request = lib.get(url, (response) => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + response.statusCode));
       }
      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on('end', () => resolve(body.join('')));
    });
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
    })
};
