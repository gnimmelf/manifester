const debug = require('debug')('mf:service:siteService');

const {
  isObject,
  inspect,
  addFileExt,
  maybeThrow,
} = require('../lib');

const parseParams = (params) => {
  inspect(params)
  const parsed = isObject(params[0]) ? params[0] : {
    siteSchemaSuffix: params[0],
    dottedPath: params[0],
  };

  parsed.schemaName = 'site.'+parsed.siteSchemaSuffix;

  return parsed;
};

module.exports = ({ dbService, schemaService }) =>
{

  const siteDb = dbService.site;

  return {

    getObj: (...params) =>
    {
      const {schemaName, siteSchemaSuffix, dottedPath} = parseParams(params);

      return schemaService.getSchema(schemaName, 'read')
        .then(schema => {

          const relPath =  addFileExt(siteSchemaSuffix);

          const data = siteDb.get(relPath, dottedPath);

          maybeThrow(!data, null, 404);

          return data;
        });
    },

    setObj: (data, ...params) =>
    // TODO! Fixme!
    {
      const {schemaName, siteSchemaSuffix, dottedPath} = parseParams(params);

      return schemaService.getSchema(schemaName, 'read')
        .then(schema => {

          const relPath =  addFileExt(siteSchemaSuffix);

          const data = siteDb.set(relPath, dottedPath, data);

          maybeThrow(!data, null, 404);

          return data;
        });
    }
  };
};