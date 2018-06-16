const debug = require('debug')('mf:middleware:authenticateHeaderToken');
const { asValue, asFunction } = require('awilix');
const { makeSingleInvoker, maybeThrow } = require('../utils');

const AUTH_FILE = 'auth.json';

module.exports = makeSingleInvoker(({ tokenKeyName, hashSecret, authService, userService }) =>
{

  return (req, res, next) =>
  {
    debug("cookies", req.cookies)

    let token = req.headers[tokenKeyName] || req.cookies[tokenKeyName];

    authService.authenticateToken(token)
      .then(decoded => {
        debug('autheticated', decoded.email);

        // TODO! Not too happy about this one, but most dependencies are circular, so no other way in...
        const currentUser = userService.setCurrentUserBy('email', decoded.email);

        next();
      })
      .catch(err => {
        debug('unauthenticated', err.message)

        delete req.headers[tokenKeyName];
        delete req.cookies[tokenKeyName];

        next();
      });
  };

});