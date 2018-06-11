const debug = require('debug')('mf:api:data');
const { maybeThrow, sendApiResponse, requestFullUrl, addFileExt } = require('../lib');

module.exports = ({ dataService }) =>
{

  return {

    getObjectIds: (req, res) =>
    {
      debug('getObjectIds', req.params)

      const { dbKey, ...params } = req.params;

      dataService.getObjectIds(dbKey, params)
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

      dataService.getObj(dbKey, params)
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

      dataService[req.params.objId ? 'updateObj' : 'createObj'](req.body, dbKey, params)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    deleteObj: (req, res) =>
    {
      debug('deleteObj', req.params);

      const { dbKey, ...params } = req.params;

      dataService.deleteObj(dbKey, params)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    }

  };
};