const debug = require('debug')('mf:service:dataService');
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

    getObjectIds: (dbKey, {schemaNameSuffix}, owner=null) =>
    {
      debug('getObjectIds', dbKey, schemaNameSuffix, owner)

      const schemaName = apiService.parseSchemaName(dbKey, schemaNameSuffix);

      return schemaService.getSchema(schemaName, 'read', {owner: owner})
        .then(schema => {

          const relPath = (owner ? owner.userId+'/' : '') + schemaNameSuffix;

          const data = dbService[dbKey].get(relPath);

          return data ? Object.keys(data) : [];
        });
    },

    getObj: (dbKey, {schemaNameSuffix, objId, dottedPath, raw}, owner=null) =>
    {
      debug('getObj >', dbKey, schemaNameSuffix, objId, dottedPath, owner);

      const schemaName = apiService.parseSchemaName(dbKey, schemaNameSuffix);

      return schemaService.getSchema(schemaName, 'read', {owner: owner})
        .then(schema => {

          const relPath = (owner ? owner.userId+'/' : '') + schemaNameSuffix + (objId ? addFileExt('/'+objId) : '');

          debug('getObj', relPath);

          const data = dbService[dbKey].get(relPath, dottedPath, {raw: !!parseInt(raw)});

          maybeThrow(!data, `ObjId '${objId}' not found`, 404);

          return data;
        });
    },

    createObj: (dbKey, data, {schemaNameSuffix}, owner=null) =>
    {
      debug('getObj >', data, dbKey, schemaNameSuffix, owner);

      const schemaName = apiService.parseSchemaName(dbKey, schemaNameSuffix);

      return schemaService.getSchema(schemaName, 'create', {owner: owner})
        .then(schema => {

          // Validate `data` vs `schema`
          const ajv = apiService.makeAJV();
          const isValid = ajv.validate(schema, data);
          maybeThrow(!isValid, ajv.errors, 400);

          // Set `objId` based on `idProperty`
          const idPropertyValue = jsonPointer.get(data, schema.idProperty);
          const objId = slug(idPropertyValue.toLowerCase());
          maybeThrow(!objId, `Expected "${schema.idProperty}" to create objId`, 400);

          // Set db-`relPath`
          const relPath = (owner ? owner.userId+'/' : '') + schemaNameSuffix + addFileExt('/'+objId);

          // Check if `objId` already exists
          maybeThrow(dbService[dbKey].get(relPath), `objId '${idPropertyValue}' already exists`, 400);

          // Update Db
          const success = dbService[dbKey].set(relPath, data);
          maybeThrow(!success, 'Could not create object', 424);

          // Write commits to disk
          dbService[dbKey].push();

          // Return data
          return {
            created: {
              objId: objId,
              data: data,
            }
          };
        });
    },

    updateObj: (dbKey, data, {schemaNameSuffix, objId, dottedPath=null}, owner=null) =>
    {
      debug('updateObj >', data, dbKey, schemaNameSuffix, owner);

      const schemaName = apiService.parseSchemaName(dbKey, schemaNameSuffix);

      return schemaService.getSchema(schemaName, 'update', {owner: owner})
        .then(schema => {

          // Set db-`relPath`
          const relPath = (owner ? owner.userId+'/' : '') + schemaNameSuffix + addFileExt('/'+objId);

          // Get object-clone from db
          const dbObj = dbService[dbKey].get(relPath, {clone: true});

          // Check that it exists
          maybeThrow(!dbObj, `ObjId '${objId}' not found`, 404);

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

          // Validate saturated `data` vs `schema`
          const isValid = ajv.validate(schema, data);
          maybeThrow(!isValid, ajv.errors, 400);

          // Update Db
          const success = dbService[dbKey].set(relPath, data);
          maybeThrow(!success, 'Could not update object', 424);

          // Write commits to disk
          dbService[dbKey].push();

          // Return updated data
          return {
            updated: {
              data: objDiff.updatedDiff(dbObj, data),
              objId: objId,
            }
          };;
        });
    },

    deleteObj: (dbKey, {schemaNameSuffix, objId, dottedPath}, owner=null) =>
    {
      debug('deleteObj >', data, dbKey, schemaNameSuffix, owner);

      const schemaName = apiService.parseSchemaName(dbKey, schemaNameSuffix);

      return schemaService.getSchema(schemaName, 'delete', {owner: owner})
        .then(schema => {

          const relPath = (owner ? owner.userId+'/' : '') + schemaNameSuffix + addFileExt('/'+objId);

          // Get object-clone from db
          const dbObj = dbService[dbKey].get(relPath, {clone: true});

          // Check that it exists
          maybeThrow(!dbObj, `ObjId '${objId}' not found`, 404);

          if (dottedPath) {
            // De-saturate `dbObj` by deleting `dottedPath`
            dotProp.delete(dbObj, dottedPath)

            // Validate `dbObj` vs `schema`
            const isValid = ajv.validate(schema, dbObj);
            maybeThrow(!isValid, ajv.errors, 400);
          }

          // Update Db
          const success = dbService[dbKey].delete(relPath, dottedPath);
          maybeThrow(!success, 'Could not delete object', 424);

          // Write commits to disk
          dbService[dbKey].push();

          return success;
        });

    },

  };

};