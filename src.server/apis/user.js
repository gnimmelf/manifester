const debug = require('debug')('mf:api:user');

const {
  sendApiResponse,
  requestFullUrl,
  maybeThrow } = require('../lib');

module.exports = ({ userService, authService, contentService, tokenKeyName }) =>
{

  return {

    getCurrentUser: (req, res) =>
    {
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

    getData: (req, res) =>
    {
      debug('getData', req.params)

      const { userHandle, schemaName, objId } = req.params;

      return new Promise((resolve, reject) =>
      {
        const user = userService.getUserBy('handle', userHandle);

        maybeThrow(!user, `No user found by handle '${userHandle}'`, 401)

        debug('getData::owner', user)

        resolve(user);
      })
      .then((owner) => {
        return contentService.getData(schemaName, objId, owner);
      })
      .then(data => {
        sendApiResponse(res, data);
      })
      .catch(err => {
        sendApiResponse(res, err);
      });
    },

    invalidateSession: (req, res) =>
    {
      var token = req.params.token || req.cookies[tokenKeyName];

      authService.authenticateToken(token)
        .then(decoded => {
          res.clearCookie(tokenKeyName);
          return authService.invalidateToken(decoded.email);
        })
        .then(payload => {
          sendApiResponse(res, payload);
        })
        .catch(err => {
          sendApiResponse(res, err);
        });
    },

  };
};