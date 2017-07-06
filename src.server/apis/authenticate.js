const debug = require('debug')('apis:authenticate');

const { sendApiResponse } = require('../lib');

module.exports = ({ authService, tokenKeyName }) =>
{

  const requestLogincodeByEmail = (req, res) =>
  {
    authService.requestLogincodeByEmail(req.params.email)
      .then(logincode => {
        sendApiResponse(res, { 'email': req.params.email })
      })
      .catch(err => {
        sendApiResponse(res, err)
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
        sendApiResponse(res, decoded);
      })
      .catch(err => {
        sendApiResponse(res, err)
      });
  };

  /**
   * Public
   */
  return {
    requestLogincodeByEmail: requestLogincodeByEmail,
    authenticateLogincode: authenticateLogincode,
    authenticateToken: authenticateToken,
  };
};