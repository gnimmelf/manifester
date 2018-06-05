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
    {
      debug('getObj', req.params)

      let { schemaName } = req.params;

      schemaName = RE_SITE_SCHEMA_MASK.test(schemaName) ? schemaName : 'site.'+schemaName;

      dataService.getObj(RE_SITE_SCHEMA_MASK, {
        ...req.params,
        schemaName: schemaName,
        objId: schemaName.replace(RE_SITE_SCHEMA_MASK, ''),
      })
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

      dataService[req.params.objId ? 'updateObj' : 'createObj'](SITE_SCHEMA_MASK, req.body, {
        ...req.params,
        objId: (req.params.schemaName || '').replace(RE_SITE_SCHEMA_MASK, ''),
      })
      .then(data => {
        sendApiResponse(res, data)
      })
      .catch(err => {
        sendApiResponse(res, err)
      });
    },

  };
};