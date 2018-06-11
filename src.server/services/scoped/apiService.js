const debug = require('debug')('mf:service:apiService');
const Ajv = require('ajv');
const jsonPointer = require('js-pointer');
const slug = require('slug');
const {
  maybeThrow,
  makeSingleInvoker,
} = require('../../lib');

const draft06 = require('ajv/lib/refs/json-schema-draft-06.json');

module.exports = ({ dbService, userService }) =>
{
  const dbKeys = Object.keys(dbService);
  const siteDb = dbService.site;

  return {

    getSettings: (dottedPath=null) => ({
      ...siteDb.get('site.settings.public.json', dottedPath, {raw: true}),
      ...(userService.currentUser ? siteDb.get('site.settings.private.json', dottedPath, {raw: true}) : {}),
    }),

    makeSingleInvoker: makeSingleInvoker,

    makeAJV: (ajvOptions={}) => {
      return new Ajv({
        allErrors: true,
        jsonPointers: true,
        removeAdditional: true,
        ...ajvOptions,
      });
      // TODO! Make default optional
      ajv.addMetaSchema(draft06);
    },

    parseSchemaName: (schemaNamePrefix, schemaNameSuffix) =>
    {
      return `${schemaNamePrefix}.${schemaNameSuffix}`.replace(/\.+/g, '.');;
    },

    schemaName2parts: (schemaName) =>
    //
    {
      const [_, dbPart, pathPart] = schemaName.match(/^(.*)\.(.*)/)

      const dbKey = dbKeys[dbPart];

      maybeThrow(!dbKey, 422);

      debug('schemaName2parts', schemaName+' =>', [dbKey, pathPart])

      return {
        dbKey: dbKey,
        pathPart: pathPart,
      }
    },

  };
}