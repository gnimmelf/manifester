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


module.exports = ({ dbService, apiService, schemaService }) =>
{

  return {
    getObj: (schemaNamePrefix, {schemaNameSuffix, dottedPath, raw}) =>
    {
      const schemaName = apiService.parseSchemaName(schemaNamePrefix, schemaNameSuffix);

      return schemaService.getSchema(schemaName, 'read')
        .then(schema => {

          const {dbKey, pathPart} = apiService.schemaName2parts(schemaName);

          const relPath =  addFileExt(pathPart);

          const data = dbService[dbKey].get(relPath, dottedPath, {raw: !!parseInt(raw)});

          maybeThrow(!data, null, 404);

          return data;
        });
    },

    setObj: (schemaNamePrefix, data, {schemaNameSuffix, dottedPath}) =>
    {
      const schemaName = apiService.parseSchemaName(schemaNamePrefix, schemaNameSuffix);

      return schemaService.getSchema(schemaName, 'update')
        .then(schema => {

          const {dbKey, pathPart} = apiService.schemaName2parts(schemaName);

          const relPath =  addFileExt(pathPart);

          // Get object-clone from db
          const dbObj = dbService[dbKey].get(relPath, {clone: true});

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
    },

  };
};