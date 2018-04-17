const debug = require('debug')('mf:apis:authenticate');

const { sendApiResponse } = require('../lib');

module.exports = ({ authService, tokenKeyName }) =>
{


  return {

    requestLoginCodeByEmail: (req, res) => {

      authService.requestLoginCodeByEmail(req.body.email)
        .then(loginCode => {
          sendApiResponse(res, { email: req.body.email })
        })
        .catch(err => {
          sendApiResponse(res, err)
        });

    },

    exchangeLoginCode2Token: (req, res) => {

      authService.exchangeLoginCode2Token(req.body.email, req.body.code)
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