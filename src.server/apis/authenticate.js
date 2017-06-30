const debug = require('debug')('apis:authenticate');

module.exports = ({ authService, tokenHeaderName, tokenCookieName }) =>
{

  const deleteCookie = (res) => res.clearCookie(tokenCookieName);;
  const setCookie = (res, value) => res.cookie(tokenCookieName, token, {});


  const requestLogincodeByMail = (req, res) =>
  {
    authService.requestLogincodeByMail(req.params.email)
      .catch(res.jsend.fail)
      .then(logincode => {
        res.jsend.success('Mail away!')
      });
  };


  const authenticateLogincode = (req, res) =>
  {
    authService.authenticateLogincode(req.params.email, req.params.code)
      .then(res.jsend.success)
      .catch(res.jsend.fail)
  };

  const authenticateToken = (req, res) =>
  {
    var token = req.params.token;

    authService.authenticateToken(token)
      .then(decoded => {
        res.jsend.success(decoded);
      })
      .catch(err => {
        res.jsend.fail(err);
      });
  };

  /**
   * Public
   */
  return {
    requestLogincodeByMail: requestLogincodeByMail,
    authenticateLogincode: authenticateLogincode,
    authenticateToken: authenticateToken,
  };
};