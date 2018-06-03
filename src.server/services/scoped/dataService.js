const debug = require('debug')('mf:service:contentService');
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

// Set up Ajv
ajv = new Ajv({
  allErrors: true,
  jsonPointers: true,
  removeAdditional: true,
});
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

const schemaNameMatch = (reSchemaMask, schemaName) => maybeThrow(!schemaName.match(reSchemaMask), null, 404)

const schemaName2parts = (schemaName) =>
{
  const [_, dbPart, pathPart] = schemaName.match(/^(.*)\.(.*)/)

  const dbKey = {
    'content': 'content',
    'site': 'site',
    'user': 'users',
  }[dbPart];

  maybeThrow(!dbKey, 422);

  debug('schemaName2parts', schemaName+' =>', [dbKey, pathPart])

  return {
    dbKey: dbKey,
    pathPart: pathPart,
  }
}

module.exports = ({ dbService, schemaService, userService }) =>
{
  return {

    getObjectIds: (reSchemaMask, {schemaName}, owner=null) =>
    {
      schemaNameMatch(reSchemaMask, schemaName);

      return schemaService.getSchema(schemaName)
        .then(schema => {

          userService.authorizeByACL(schema.ACL, 'read', owner);

          const {dbKey, pathPart} = schemaName2parts(schemaName);

          const relPath = (owner ? owner.userId+'/' : '') + pathPart;

          const data = dbService[dbKey].get(relPath);

          return data ? Object.keys(data) : [];
        });
    },

    getObj: (reSchemaMask, {schemaName, objId}, owner=null) =>
    {
      schemaNameMatch(reSchemaMask, schemaName);

      return schemaService.getSchema(schemaName)
        .then(schema => {

          userService.authorizeByACL(schema.ACL, 'read', owner);

          const {dbKey, pathPart} = schemaName2parts(schemaName);

          const relPath = (owner ? owner.userId+'/' : '') + pathPart + (objId ? addFileExt('/'+objId) : '');

          const data = dbService[dbKey].get(relPath);

          maybeThrow(!data, `ObjId '${objId}' not found`, 404);

          return data;
        });
    },

    createObj: (reSchemaMask, data, {schemaName}, owner=null) =>
    {
      debug('createObj', data)

      schemaNameMatch(reSchemaMask, schemaName);

      return schemaService.getSchema(schemaName)
      .then(schema => {

          let isValid;
          const {dbKey, pathPart} = schemaName2parts(schemaName);

          // Authorize
          userService.authorizeByACL(schema.ACL, 'create', owner);

          // Validate `data` vs `schema`
          isValid = ajv.validate(schema, data);
          maybeThrow(!isValid, ajv.errors, 400);

          // Set `objId` based on `idProperty`
          const idPropertyValue = jsonPointer.get(data, schema.idProperty);
          const objId = slug(idPropertyValue.toLowerCase());
          maybeThrow(!objId, `Expected "${schema.idProperty}" to create objId`, 400);

          // Set db-`relPath`
          const relPath = (owner ? owner.userId+'/' : '') + pathPart + addFileExt('/'+objId);

          // Check if `objId` already exists
          maybeThrow(dbService[dbKey].get(relPath), `objId '${idPropertyValue}' already exists`, 400);

          // Update Db
          const success = dbService[dbKey].set(relPath, data);
          maybeThrow(!success, 'Could not update Db', 424);

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

    updateObj: (reSchemaMask, data, {schemaName, objId, dottedPath=null}, owner=null) =>
    {
      debug('updateObj', data)

      schemaNameMatch(reSchemaMask, schemaName);

      return schemaService.getSchema(schemaName)
      .then(schema => {

          let isValid, saturated;
          const {dbKey, pathPart} = schemaName2parts(schemaName);

          // Authorize
          userService.authorizeByACL(schema.ACL, 'create', owner);

          // Set db-`relPath`
          const relPath = (owner ? owner.userId+'/' : '') + pathPart + addFileExt('/'+objId);

          // Get object from db
          const dbObj = dbService[dbKey].get(relPath);

          // Check that it exists
          maybeThrow(!dbObj, `ObjId '${objId}' not found`, 404);

          debug('updateObj', 'dbObj', dbObj);

          // Saturate `data`
          if (dottedPath) {
            // NOTE! `dottedPath` sets a `data`-set at the `dottedPath`
            const value = dotProp.set({}, dottedPath, data);
            debug('updateObj', 'dottedPath', value);
            data = deepAssign({}, dbObj, value);
          }
          else {
            data = deepAssign({}, dbObj, data);
          }

          debug('updateObj', 'data', data);

          // Validate `data` vs `schema`
          isValid = ajv.validate(schema, data);
          maybeThrow(!isValid, ajv.errors, 400);

          // Update Db
          const success = dbService[dbKey].set(relPath, data);
          maybeThrow(!success, 'Could not update Db', 424);

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

    delObj: (reSchemaMask, {schemaName, objId=null, dottedPath=null}, owner=null) =>
    // TODO! `dottedPath`?
    // TODO! Fixme!
    {
      schemaNameMatch(reSchemaMask, schemaName);

      return schemaService.getSchema(schemaName)
      .then(schema => {

        const operation = 'delete';

        userService.authorizeByACL(schema.ACL, operation, owner);

        const {dbKey, pathPart} = schemaName2parts(schemaName);

        const relPath = (owner ? owner.userId+'/' : '')+ pathPart + (objId ? addFileExt('/'+objId) : '');

        const success = dbService[dbKey].delete(relPath);

        maybeThrow(!success, 'Could not update Db', 424);

        // Write commits to disk
        dbService[dbKey].push();

        // TODO! Return what?
        return success;

      });

    },

  };

};