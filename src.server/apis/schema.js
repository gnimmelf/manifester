const debug = require('debug')('mf:api:schemas');

const {
  sendApiResponse,
  requestFullUrl
} = require('../lib');

module.exports = ({ schemaService }) =>
{

  return {

    getSchema: (req, res) =>
    {
      debug('getSchema', req.params)

      schemaService.getSchema(req.params.schemaName)
        .then(schema => {

          // Add `schema.$id`, just because.
          schema.$id = requestFullUrl(req);

          sendApiResponse(res, schema)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },


    getSchemaNames: (req, res) =>
    {
      debug('getSchemaNames', req.params)

      schemaService.getSchemaNames(req.params.globpattern)
        .then(schemaNames => {
          sendApiResponse(res, schemaNames)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

  };
};