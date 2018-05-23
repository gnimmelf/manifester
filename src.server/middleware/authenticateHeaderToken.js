const debug = require('debug')('mf:middleware:authenticateHeaderToken');
const { makeSingleInvoker } = require('../lib');

const authenticateHeaderToken = ({ authService, tokenKeyName }) =>
{


  return (req, res, next) =>
  {
    debug("cookies", req.cookies)

    let token = req.headers[tokenKeyName] || req.cookies[tokenKeyName];

    debug(tokenKeyName, token);

    authService.authenticateToken(token)
      .then(decoded => {
        debug('autheticated', decoded)
        req.container.registerValue('currentUserEmail', decoded.email)
        next();
      })
      .catch(err => {
        debug('unauthenticated', err.message)
        req.container.registerValue('currentUserEmail', undefined)
        delete req.headers[tokenKeyName];
        delete req.cookies[tokenKeyName];
        next();
      });
  };

};


module.exports = makeSingleInvoker(authenticateHeaderToken);