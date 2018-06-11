const debug = require('debug')('mf:api:data');
const { maybeThrow, sendApiResponse, requestFullUrl, addFileExt } = require('../lib');

module.exports = ({ dataService }) =>
{

  return {

    getObjectIds: (req, res) =>
    {
      debug('getObjectIds', req.params)

      dataService.getObjectIds('content', req.params)
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

      dataService.getObj('content', req.params)
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

      dataService[req.params.objId ? 'updateObj' : 'createObj'](req.body, 'content', req.params)
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

      dataService.deleteObj('content', req.params)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    }

  };
};