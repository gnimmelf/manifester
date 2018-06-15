const debug = require('debug')('mf:api:inspect');

const expressListEndpoints = require('express-list-endpoints');
const {
  sendApiResponse,
  requestFullUrl
} = require('../lib');

module.exports = ({ mainApp }) =>
{

  const endpoints = expressListEndpoints(mainApp);

  return {

    getEndpoints: (req, res) =>
    {

      Promise.resolve(endpoints)
        .then(payload => {
          sendApiResponse(res, payload);
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

  };
};