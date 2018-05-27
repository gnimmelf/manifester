const debug = require('debug')('mf:service:contentService');
const Ajv = require('ajv');
const { maybeThrow, addFileExt } = require('../../lib');

//

ajv = new Ajv({
  allErrors: true,
  verbose: false,
}); // TODO! options can be passed, e.g. {allErrors: true}
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
      schemaNameMatch(reSchemaMask, schemaName);

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
    {
      schemaNameMatch(reSchemaMask, schemaName);

      return schemaService.getSchema(schemaName)
      .then(schema => {

          userService.authorizeByACL(schema.ACL, 'write', owner);

          const {dbKey, pathPart} = schemaName2parts(schemaName);

          const relPath = (owner ? owner.userId+'/' : '')+ pathPart + (objId ? addFileExt('/'+objId) : '');

          // TODO! Merge new data with any existing data, beware of empty vs unpassed fields!

          const valid = ajv.validate(schema, data);

          maybeThrow(!valid, null, 400, ajv.errors);


          const success = dbService[dbKey].set(relPath, data);

          maybeThrow(!success, 'Could not update Db', 424);

          // Write commits to disk
          dbService[dbKey].push();

          // Return updated data
          return data;
        });
    },

    remove: () =>
    {
      // TODO!
    }

  };

};