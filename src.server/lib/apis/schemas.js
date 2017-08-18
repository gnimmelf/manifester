const debug = require('debug')('apis:schemas');

const { sendApiResponse } = require('../');

module.exports = ({ schemaService }) =>
{

  return {

    getSchema: (req, res) => {
      debug(req.params.schemaName)

      schemaService.getSchema(req.params.schemaName)
        .then(schema => {
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