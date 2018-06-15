const debug = require('debug')('mf:service:singletonService');
const Ajv = require('ajv');
const jsonPointer = require('js-pointer');
const slug = require('slug');
const {
  maybeThrow,
  addFileExt,
  dotProp,
  objDiff,
  deepAssign
} = require('../../lib');


module.exports = ({ dbService, schemaService }) =>
{

  return {
    getObj: (dbKey, {schemaNameSuffix, dottedPath, raw}) =>
    {
      const schemaName = schemaService.makeSchemaName(dbKey, schemaNameSuffix);

      return schemaService.getSchema(schemaName, 'read')
        .then(schema => {

          // Singletons are just the schemaNameSuffix
          const relPath =  addFileExt(schemaNameSuffix);

          const data = dbService[dbKey].get(relPath, dottedPath, {raw: !!parseInt(raw)});

          maybeThrow(!data, null, 404);

          return data;
        });
    },

    updateObj: (dbKey, data, {schemaNameSuffix, dottedPath}) =>
    {
      const schemaName = schemaService.makeSchemaName(dbKey, schemaNameSuffix);

      return schemaService.getSchema(schemaName, 'update')
        .then(schema => {

          // Singletons are just the schemaNameSuffix
          const relPath =  addFileExt(schemaNameSuffix);

          // Get object-clone from db
          const dbObj = dbService[dbKey].get(relPath, {clone: true});

          // Check that it exists
          maybeThrow(!dbObj, `ObjId '${schemaNameSuffix}' not found`, 404);

          // Extract `value` from `data`, or use entire `data`-object when `value`-prop not found
          const value = dotProp.set({}, dottedPath, data.value || data);

          // Saturate `data`
          if (dottedPath) {

            // Extract `value` from `data`, or use entire `data`-object when `value`-prop not found
            const value = dotProp.set({}, dottedPath, data.value || data);

            debug('updateObj', 'dottedPath', `${dottedPath} = ${value}`);

            data = deepAssign({}, dbObj, value);
          }
          else {
            data = deepAssign({}, dbObj, data);
          }

          // Validate `dbObj` vs `schema`
          const ajv = schemaService.ajvFactory();
          const isValid = ajv.validate(schema, dbObj);
          maybeThrow(!isValid, ajv.errors, 400);

          // Update Db
          const success = dbService[dbKey].set(relPath, data);
          maybeThrow(!success, 'Could not delete object', 424);

          // Write commits to disk
          dbService[dbKey].push();

          return data;
        });
    },

  };
};