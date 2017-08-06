const debug = require('debug')('middleware:authenticateHeaderToken');
const makeSingleInvoker = require('../makeSingleInvoker');

const authenticateHeaderToken = ({ authService, tokenKeyName }) =>
{


  return (req, res, next) =>
  {

    const token = req.headers[tokenKeyName];

    debug(tokenKeyName, req.headers[tokenKeyName]);

    authService.authenticateToken(token)
      .then(decoded => {
        debug('autheticated', decoded)
        req.container.registerValue('userId', decoded.email)
        next();
      })
      .catch(err => {
        debug('unauthenticated', err.message)
        req.container.registerValue('userId', undefined)
        delete req.headers[tokenKeyName];
        next();
      });
  };

};


module.exports = makeSingleInvoker(authenticateHeaderToken);