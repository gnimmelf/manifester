const debug = require('debug')('mf:api:site');

const {
  sendApiResponse,
} = require('../lib');

module.exports = ({ schemaService, siteService }) =>
/*
  NOTE! All site-data are "singletons"
  -So per "site.*"-schema, there is only one corresponding data-file designated by the suffix after "site.".
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

      siteService.getObj(req.params)
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

      siteService.setObj(req.params)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    getGroupList: (req, res) =>
    {
      debug('getGroupList', req.params);

      siteService.getGroupList(req.params)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
      },

    getGroup: (req, res) =>
    {
      debug('getGroup', req.params);

      siteService.getGroup(req.params)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    }

  };
};