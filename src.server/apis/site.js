const debug = require('debug')('apis:site');

const {
  sendApiResponse,
  requestFullUrl,
  maybeThrow } = require('../lib');

module.exports = ({ siteService }) =>
{

  return {

    getSettings: (req, res) => {

      return new Promise((resolve, reject) => {
        const settings = siteService.getSettings();

        resolve(settings);
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