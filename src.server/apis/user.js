const debug = require('debug')('mf:api:user');

const {
  sendApiResponse,
  requestFullUrl,
  maybeThrow } = require('../lib');

module.exports = ({ userService, authService, tokenKeyName }) =>
{

  return {

    getCurrentUser: (req, res) => {

      return new Promise((resolve, reject) => {
        const user = userService.currentUser;

        maybeThrow(!user, 'Not logged in', 401)

        resolve(user);
      })
      .then(payload => {
        sendApiResponse(res, { user: payload })
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