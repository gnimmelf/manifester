const debug = require('debug')('mf:service:contentService');
const assert = require('assert');
const { maybeThrow, addFileExt } = require('../../lib');

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

    getObjectIds: (reSchemaMask, schemaName, owner=null) =>
    {
      schemaNameMatch(reSchemaMask, schemaName);

      return schemaService.getSchema(schemaName)
        .then(schema => {

          userService.authorizeByACL(schema.ACL, 'read', owner);

          const {dbKey, pathPart} = schemaName2parts(schemaName);

          const relPath = (owner ? owner.userId+'/' : '')+ pathPart;

          const data = dbService[dbKey].get(relPath);

          return data ? Object.keys(data) : [];
        });
    },

    getData: (reSchemaMask, schemaName, objId, owner=null) =>
    {
      return schemaService.getSchema(schemaName)
        .then(schema => {

          userService.authorizeByACL(schema.ACL, 'read', owner);

          const {dbKey, pathPart} = schemaName2parts(schemaName);

          const relPath = (owner ? owner.userId+'/' : '')+ pathPart + (objId ? addFileExt('/'+objId) : '');

          const data = dbService[dbKey].get(relPath);

          maybeThrow(!data, `objId '${objId}' not found`, 404);

          return data;
        });
    },

    setData: (reSchemaMask, schemaName, objId, data, owner=null) =>
    // TODO! Install AJV!
    {
      return schemaService.getSchema(req.params.schemaName)
      .then(schema => {

          userService.authorizeByACL(schema.ACL, 'write', owner);

          // TODO! Validate data VS schema

          const {dbKey, pathPart} = schemaName2parts(schemaName);

          const relPath = (owner ? owner.userId+'/' : '')+ pathPart + (objId ? addFileExt('/'+objId) : '');

          const res = dbService[dbKey].set(relPath, req.params.dottedPath, data);

          maybeThrow(!res, 'Could not update Db', 424);

          return res;
        });
    },

  };

};