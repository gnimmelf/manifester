const debug = require('debug')('mf:api:data');
const { maybeThrow, sendApiResponse, requestFullUrl, addFileExt } = require('../lib');

module.exports = ({ contentService }) =>
{

  return {

    getObjectIds: (req, res) =>
    {
      debug('getObjectIds', req.params.schemaName)

      contentService.getObjectIds(req.params.schemaName)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    getData: (req, res) =>
    {
      debug('getData', req.params.schemaName, req.params.objId)

      contentService.getData(req.params.schemaName, req.params.objId)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    setData: (req, res) =>
    {
      debug('setData', req.params.schemaName, req.params.objId)

      contentService.getData(req.params.schemaName, req.params.objId)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

  };
};