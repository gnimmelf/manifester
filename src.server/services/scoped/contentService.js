const debug = require('debug')('mf:service:contentService');
const assert = require('assert');
const { maybeThrow, addFileExt } = require('../../lib');

module.exports = ({ dbService, schemaService, authService, userService }) =>
{

  const contentDb = dbService.content;

  return {

    getObjectIds: (schemaName) =>
    {
      return schemaService.getSchema(schemaName)
        .then(schema => {

          debug('schema', schema)

          authService.authorize(userService.currentUser, schema, 'read');

          const relPath = schemaName.replace(/^content\./, '');

          const data = contentDb.get(relPath);

          return Object.keys(data);
        });
    },

    getData: (schemaName, objId, owner=null) =>
    {
      return schemaService.getSchema(schemaName)
        .then(schema => {

          debug('schema', schema)

          authService.authorize(userService.currentUser, schema, 'read', owner);

          const [_, dbPart, pathPart] = schemaName.match(/^(.*)\.(.*)/)

          const dbKey = {
            'content': 'content',
            'site': 'site',
            'user': 'users',
          }[dbPart];

          maybeThrow(!dbKey, 422);

          const relPath = (owner ? owner.userId+'/' : '')+ pathPart + (objId ? addFileExt('/'+objId) : '');

          const data = dbService[dbKey].get(relPath);

          maybeThrow(!data, `objId '${objId}' not found`, 404);

          return data;
        });
    },

    setData: (schemaName, objId, data) =>
    {
      return schemaService.getSchema(req.params.schemaName)
      .then(schema => {

          authService.authorize(userService.currentUser, schema, 'write');

          // TODO! Validate data VS schema

          let relPath = req.params.schemaName.replace(/^content\./, '')

          if (req.params.fileId) {
            relPath += addFileExt('/'+req.params.fileId);
          }

          maybeThrow(!true, contentDb.set(relPath, req.params.dottedPath, data), 'Could not update Db', 424);

          return success;
        });
    },

  };

};