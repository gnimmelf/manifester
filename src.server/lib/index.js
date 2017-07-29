const path = require('path');
const join = path.join;
const jsend = require('jsend')({ strict: false });

const upquire = exports.upquire = require('upquire');
const RESTfulError = require('./RESTfulError');

exports.makeSingleInvoker = require('./makeSingleInvoker')
exports.makeLogincode = require('./makeLogincode');
exports.getBowerComponentsResources = require('./getBowerComponentsResources');
exports.configureContainer = require('./configureContainer');
exports.Db = require('./Db');
exports.dotProp = require('./dotProp');


exports.upquirePath = function(some_path, ...rest)
{
  let full_path = upquire(some_path, { pathOnly: true, dirnameOnly: true });
  if (rest) {
    full_path = join.apply(join, [full_path].concat( rest ));
  }
  return full_path;
}


exports.sendApiResponse = (expressResponseObj, response) =>
{
  let method = 'success';

  if (response instanceof Error) {
    if (response instanceof RESTfulError) {
      method = 'fail';
      response = [response.code, response.name, response.message].join('|');
    }
    else {
      method = 'error';
    }
  }
  expressResponseObj.json(jsend[method](response));
}


exports.maybeThrow = (predicate, message, RestErrorTypeOrCode) =>
{
  if (predicate) {
    if (RestErrorTypeOrCode) {
      throw new RESTfulError(RestErrorTypeOrCode, message);
    }
    else throw new Error(message);
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
