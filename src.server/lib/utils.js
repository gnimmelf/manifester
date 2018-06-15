const path = require('path');
const join = path.join;
const RESTfulError = require('./RESTfulError');
const upquire = exports.upquire = require('upquire');
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

exports.isObject = (a) => (!!a) && (a.constructor === Object);
exports.isArray = (a) => (!!a) && (a.constructor === Array);

exports.getRequestFullUrl = (expressRequestObj) =>
{
  const req = expressRequestObj;
  const secure = req.connection.encrypted || req.headers['x-forwarded-proto'] === 'https'
  return `http${(secure ? 's' : '')}://${req.headers.host}${req.originalUrl}`;
};

exports.maybeThrow = (predicate, messageOrData, RestErrorTypeOrCode) =>
{
  const message = typeof messageOrData == 'string' ? messageOrData : undefined;
  const data = message ? undefined : messageOrData;

  if (predicate) {
    if (RestErrorTypeOrCode && RESTfulError.getByTypeOrCode(RestErrorTypeOrCode)) {
      const err = new RESTfulError(RestErrorTypeOrCode, message);
      if (data) err.data = data;
      throw err;
    }
    else if (message) {
      throw new Error(message);
    }
    else if (predicate instanceof Error) {
      throw predicate;
    }
  }
}

exports.addFileExt = (path, ext=".json") => path.endsWith(ext) ? path : `${path}.json`;
