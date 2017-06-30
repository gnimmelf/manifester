module.exports = ({ authService, tokenHeaderName }) =>
{
  return (req, res, next) =>
  {
    var token = req.headers[tokenHeaderName];

    authService.authenticateToken(token)
      .then(decoded => {
        req.container.registerValue('userId', decoded.email)
        next();
      })
      .catch(err => {
        delete req.headers[tokenHeaderName];
        next();
      });
  };

};
