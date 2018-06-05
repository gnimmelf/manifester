const debug = require('debug')('mf:api:site');

const {
  sendApiResponse,
  requestFullUrl,
  maybeThrow } = require('../lib');

const RE_SITE_SCHEMA_MASK = new RegExp(/^site\./);

module.exports = ({ siteService, schemaService }) =>
{

  return {

    getGroups: (req, res) =>
    {
      return new Promise((resolve, reject) => {
        const groups = siteService.getGroups();
        resolve(groups);
      })
      .then(data => {
        sendApiResponse(res, data)
      })
      .catch(err => {
        sendApiResponse(res, err)
      });
    },

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
    // TODO! Fixme! Singleton, one data-file per schema
    {
      debug('getObj', req.params)
    },

    setObj: (req, res) =>
    // TODO! Fixme! Singleton, one data-file per schema
    {
      debug('setObj', req.params);
    },

    deleteObj: (req, res) =>
    // TODO! Fixme! Singleton, one data-file per schema
    {
      debug('setObj', req.params);
    }


  };
};