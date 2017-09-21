const debug = require('debug')('mf:apis:authenticate');

const { sendApiResponse } = require('../');

module.exports = ({ authService, tokenKeyName }) =>
{


  return {

    requestLogincodeByEmail: (req, res) => {

      authService.requestLogincodeByEmail(req.body.email)
        .then(logincode => {
          sendApiResponse(res, { email: req.body.email })
        })
        .catch(err => {
          sendApiResponse(res, err)
        });

    },

    exchangeLogincode2Token: (req, res) => {

      authService.exchangeLogincode2Token(req.body.email, req.body.code)
        .then(token => {
          res.cookie(tokenKeyName, token, {
            httpOnly: true,
            sameSite: "Strict"
          })
          sendApiResponse(res, { cookieName: tokenKeyName })
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