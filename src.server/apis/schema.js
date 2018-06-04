const debug = require('debug')('mf:api:schemas');

const { sendApiResponse, requestFullUrl } = require('../lib');

module.exports = ({ schemaService }) =>
{

  return {

    getSchema: (req, res) =>
    {
      debug(req.params.schemaName)

      schemaService.getSchema(req.params.schemaName)
        .then(schema => {

          // Add `schema.$id`, just because.
          schema.$id = requestFullUrl(req);

          sendApiResponse(res, { schema: schema })
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },


    getSchemaNames: (req, res) =>
    {
      schemaService.getSchemaNames(req.params.globpattern)
        .then(schemaNames => {
          sendApiResponse(res, { schemas: schemaNames })
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

  };
};