const debug = require('debug')('apis:authenticate');

const { sendApiResponse } = require('../');

module.exports = ({ authService, tokenKeyName }) =>
{


  return {

    requestLogincodeByEmail: (req, res) => {

      authService.requestLogincodeByEmail(req.params.email)
        .then(logincode => {
          sendApiResponse(res, { email: req.params.email })
        })
        .catch(err => {
          sendApiResponse(res, err)
        });

    },

    authenticateLogincode: (req, res) => {

      authService.authenticateLogincode(req.params.email, req.params.code, req.query.renewtoken ? true : false)
        .then(token => {
          sendApiResponse(res, { token: token })
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    authenticateToken: (req, res) => {
      var token = req.params.token;

      authService.authenticateToken(token)
        .then(decoded => {
          sendApiResponse(res, decoded);
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

  };
};