const debug = require('debug')('mf:api:site');

const {
  sendApiResponse,
} = require('../lib');

const RE_SCHEMA_NAME_MASK = new RegExp(/^site\./);

module.exports = ({ schemaService, dataService }) =>
/*
  NOTE! All site-data are "singletons"
  -So per "site.*"-schema, there is only one corresponding ".json"-data-file designated by the suffix after "site.".
*/
{

  return {

    getObjectIds: (req, res) =>
    {
      debug('getObjectIds', req.params)

      schemaService.getSchemaNames('site.*')
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

      dataService.singleton.getObj(RE_SCHEMA_NAME_MASK, req.params)
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

      dataService.singleton.setObj(RE_SCHEMA_NAME_MASK, req.body, req.params)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

  };
};