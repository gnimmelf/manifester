const makeSingleInvoker = require('../makeSingleInvoker');

const authenticateHeaderToken = ({ authService, tokenKeyName }) =>
{
  return (req, res, next) =>
  {
    var token = req.headers[tokenKeyName];

    authService.authenticateToken(token)
      .then(decoded => {
        req.container.registerValue('userId', decoded.email)
        next();
      })
      .catch(err => {
        delete req.headers[tokenKeyName];
        next();
      });
  };

};


module.exports = makeSingleInvoker(authenticateHeaderToken);