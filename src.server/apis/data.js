const debug = require('debug')('apis:data');

const { sendApiResponse, requestFullUrl, addFileExt } = require('../lib');

module.exports = ({ dbService, schemaService }) =>
{

  const contentDb = dbService.content;

  console.log('Tree:', contentDb.tree)

  return {

    getData: (req, res) => {

      schemaService.getSchema(req.params.schemaName)
      .then(schema => {

        console.log('schema', schema)

        let relPath = req.params.schemaName.replace(/^content\./, '')
        if (req.params.fileId) {
          relPath += addFileExt('/'+req.params.fileId);
        }

        const data = contentDb.get(relPath);

        return data;
      })
      .then(data => {
        sendApiResponse(res, data)
      })
      .catch(err => {
        sendApiResponse(res, err)
      });

    },

    setData: (req, res) => {

      return new Promise((resolve, reject) => {

        // set(relPath, key='', value=undefined)

        const data = contentDb.get(req.params.schemaName)

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