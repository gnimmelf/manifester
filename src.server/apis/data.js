const debug = require('debug')('mf:api:data');
const { maybeThrow, sendApiResponse, requestFullUrl, addFileExt } = require('../lib');

module.exports = ({ contentService }) =>
{

  return {

    getObjectIds: (req, res) =>
    {
      debug('getObjectIds', req.params)

      const { schemaName } = req.params;

      contentService.getObjectIds('^content', schemaName)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    getData: (req, res) =>
    {
      debug('getData', req.params)

      const { schemaName, objId } = req.params;

      contentService.getData('^content', schemaName, objId)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    setData: (req, res) =>
    {
      debug('setData', req.params);

      const { schemaName, objId } = req.params;
      const data = req.body;

      contentService.setData('^content', schemaName, objId, data, )
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

  };
};