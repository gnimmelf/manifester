const debug = require('debug')('mf:api:user');

const {
  sendApiResponse,
  requestFullUrl,
  maybeThrow } = require('../lib');

const USER_SCHEMA_MASK = '^user';

module.exports = ({ userService, authService, dataService, tokenKeyName }) =>
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
        sendApiResponse(res, payload)
      })
      .catch(err => {
        sendApiResponse(res, err)
      });

    },

    getCurrentUserGroups: (req, res) =>
    {
      return new Promise((resolve, reject) => {
        const user = userService.currentUser;

        maybeThrow(!user, 'Not logged in', 401)

        resolve(user.groups);
      })
      .then(payload => {
        sendApiResponse(res, payload)
      })
      .catch(err => {
        sendApiResponse(res, err)
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

    getObjectIds: (req, res) =>
    {
      debug('getObjectIds', req.params)

      getUserByHandle(req.params.userHandle)
        .then((owner) => {
          return dataService.getObjectIds(USER_SCHEMA_MASK, req.params, owner);
        })
        .then(data => {
          sendApiResponse(res, data);
        })
        .catch(err => {
          sendApiResponse(res, err);
        });
    },

    getObj: (req, res) =>
    {
      debug('getObj', req.params)

      getUserByHandle(req.params.userHandle)
        .then((owner) => {
          return dataService.getObj(USER_SCHEMA_MASK, req.params, owner);
        })
        .then(data => {
          sendApiResponse(res, data);
        })
        .catch(err => {
          sendApiResponse(res, err);
        });
    },

    setObj: (req, res) =>
    {
      debug('setObj', req.params);

      getUserByHandle(req.params.userHandle)
        .then((owner) => {
          return dataService.setObj(USER_SCHEMA_MASK, req.body, req.params, owner);
        })
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

  };
};