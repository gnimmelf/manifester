const debug = require('debug')('mf:api:singleton');

const {
  sendApiResponse,
} = require('../utils');

module.exports = ({ schemaService, singletonService, apiService }) =>
/*
  NOTE! All site-data are "singletons"
  -So per "site.*"-schema, there is only one corresponding ".json"-data-file designated by the suffix after "site.".
*/
{

  return {

    getObjectIds: (req, res) =>
    {
      debug('getObjectIds', req.params)

      const { dbKey, globpattern } = req.params;

      const fullGlobPattern = apiService.parseSchemaName(dbKey, globpattern);

      schemaService.getSchemaNames(fullGlobPattern)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    getObj: (req, res) =>
    {
      debug('getObj', req.params)

      const { dbKey, ...params } = req.params;

      singletonService.getObj(dbKey, params)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    setObj: (req, res) =>
    {
      debug('setObj', req.params);

      const { dbKey, ...params } = req.params;

      singletonService.updateObj(dbKey, req.body, params)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

  };
};