const debug = require('debug')('mf:api:data');
const { maybeThrow, sendApiResponse, requestFullUrl, addFileExt } = require('../lib');

const CONTENT_SCHEMA_MASK = '^content';

module.exports = ({ dataService }) =>
{

  return {

    getObjectIds: (req, res) =>
    {
      debug('getObjectIds', req.params)

      dataService.getObjectIds(CONTENT_SCHEMA_MASK, req.params)
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

      dataService.getObj(CONTENT_SCHEMA_MASK, req.params)
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

      let serviceFnName;

      dataService[req.params.objId ? 'updateObj' : 'createObj'](CONTENT_SCHEMA_MASK, req.body, req.params)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

  };
};