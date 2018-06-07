const debug = require('debug')('mf:api:data');
const { maybeThrow, sendApiResponse, requestFullUrl, addFileExt } = require('../lib');

const RE_CONTENT_SCHEMA_MASK = new RegExp(/^content\./);

module.exports = ({ dataService }) =>
{

  return {

    getObjectIds: (req, res) =>
    {
      debug('getObjectIds', req.params)

      dataService.getObjectIds(RE_CONTENT_SCHEMA_MASK, req.params)
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

      dataService.getObj(RE_CONTENT_SCHEMA_MASK, req.params)
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

      dataService[req.params.objId ? 'updateObj' : 'createObj'](RE_CONTENT_SCHEMA_MASK, req.body, req.params)
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

      dataService.deleteObj(RE_CONTENT_SCHEMA_MASK, req.body, req.params)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    }

  };
};