const debug = require('debug')('apis:data');

const {
  sendApiResponse,
  requestFullUrl,
  maybeThrow } = require('../lib');

module.exports = ({ userService }) =>
{



  return {

    getCurrentUser: (req, res) => {

      return new Promise((resolve, reject) => {
        const userData = userService.currentUser;

        maybeThrow(!userData, 'Not logged in', 401)

        resolve(data);
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