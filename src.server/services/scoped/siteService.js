const debug = require('debug')('mf:service:siteService');
const {
  addFileExt,
  maybeThrow,
} = require('../../lib');

const getSiteSchemaName = (siteSchemaSuffix) => 'site.'+siteSchemaSuffix;

module.exports = ({ dbService, schemaService, userService }) =>
{

  const siteDb = dbService.site;

  // TODO! Cache everything?

  return {

    getSettings: (dottedPath=null) => ({
      ...siteDb.get('settings.public.json', dottedPath, {raw: true}),
      ...(userService.currentUser ? siteDb.get('settings.private.json', dottedPath, {raw: true}) : {}),
    }),

    getObj: ({siteSchemaSuffix, objId, dottedPath, raw}) =>
    // TODO! Move into "singleton" data-service?
    {
      const schemaName = getSiteSchemaName(siteSchemaSuffix);

      return schemaService.getSchema(schemaName, 'read')
        .then(schema => {

          const relPath =  addFileExt(siteSchemaSuffix);

          const data = siteDb.get(relPath, dottedPath, {raw: !!parseInt(raw)});

          maybeThrow(!data, null, 404);

          return data;
        });
    },

    setObj: (data, {siteSchemaSuffix, objId, dottedPath}) =>
    // TODO! Move into "singleton" data-service?
    {
      maybeThrow(!(objId && dottedPath), `Missing params, 'objId' and 'dottedPath' required`, 400);

      const schemaName = getSiteSchemaName(siteSchemaSuffix);;

      return schemaService.getSchema(schemaName, 'update')
        .then(schema => {

          const relPath =  addFileExt(siteSchemaSuffix);

          // Get object-clone from db
          const dbObj = siteDb.get(relPath, {clone: true});

          // Check that it exists
          maybeThrow(!dbObj, `ObjId '${objId}' not found`, 404);

          // Extract `value` from `data`, or use entire `data`-object when `value`-prop not found
          const value = dotProp.set({}, dottedPath, data.value || data);

          // Saturate `dbObj`
          deepAssign(dbObj, value);

          // Validate `dbObj` vs `schema`
          const isValid = ajv.validate(schema, dbObj);
          maybeThrow(!isValid, ajv.errors, 400);

          // Update Db
          const success = dbService[dbKey].set(relPath, dottedPath);
          maybeThrow(!success, 'Could not delete object', 424);

          maybeThrow(!data, null, 404);

          return data;
        });
    }

  };
};