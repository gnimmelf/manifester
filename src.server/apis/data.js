const debug = require('debug')('apis:data');

const { sendApiResponse, requestFullUrl, addFileExt } = require('../lib');

module.exports = ({ dbService, schemaService }) =>
{

  const contentDb = dbService.content;

  return {

    getData: (req, res) => {

      return new Promise((resolve, reject) => {
        const data = contentDb.get(schemaName);

        console.log('data', data)

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