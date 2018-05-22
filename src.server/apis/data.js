const debug = require('debug')('mf:api:data');
const { maybeThrow, sendApiResponse, requestFullUrl, addFileExt } = require('../lib');

module.exports = ({ contentService }) =>
{

  return {

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