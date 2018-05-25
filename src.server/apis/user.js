const debug = require('debug')('mf:api:user');

const {
  sendApiResponse,
  requestFullUrl,
  maybeThrow } = require('../lib');

module.exports = ({ userService, authService, contentService, tokenKeyName }) =>
{

  const getUserByHandle = (handle) =>
  {
    return new Promise((resolve, reject) =>
    {
      const user = userService.getUserBy('handle', handle);

      maybeThrow(!user, `No user found by handle '${handle}'`, 404)

      debug('getUserByHandle', user)

      resolve(user);
    })
  }

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

    getObjectIds: (req, res) =>
    {
      debug('getObjectIds', req.params)

      const { userHandle, schemaName } = req.params;

      getUserByHandle(userHandle)
        .then((owner) => {
          return contentService.getObjectIds(schemaName, owner);
        })
        .then(data => {
          sendApiResponse(res, data);
        })
        .catch(err => {
          sendApiResponse(res, err);
        });
    },

    getData: (req, res) =>
    {
      debug('getData', req.params)

      const { userHandle, schemaName, objId } = req.params;

      getUserByHandle(userHandle)
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

    setData: (req, res) =>
    {
      debug('getData', req.params)

      // TODO!
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