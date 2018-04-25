const debug = require('debug')('apis:user');

const {
  sendApiResponse,
  requestFullUrl,
  maybeThrow } = require('../lib');

module.exports = ({ userService, authService, tokenKeyName }) =>
{

  return {

    getCurrentUser: (req, res) => {

      return new Promise((resolve, reject) => {
        const userData = userService.currentUser;

        maybeThrow(!userData, 'Not logged in', 401)

        resolve(userData);
      })
      .then(data => {
        sendApiResponse(res, data)
      })
      .catch(err => {
        sendApiResponse(res, err)
      });

    },

    invalidateSession: (req, res) => {
      var token = req.params.token || req.cookies[tokenKeyName];

      authService.authenticateToken(token)
        .then(decoded => {
          res.clearCookie(tokenKeyName);
          return authService.invalidateToken(decoded.email)
        })
        .then(payload => {
          sendApiResponse(res, payload)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

  };
};