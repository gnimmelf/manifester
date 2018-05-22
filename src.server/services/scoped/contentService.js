const debug = require('debug')('mf:service:contentService');
const { maybeThrow, sendApiResponse, requestFullUrl, addFileExt } = require('../../lib');

module.exports = ({ dbService, schemaService, authService, userService }) =>
{

  const contentDb = dbService.content;

  return {

    getData: (schemaName, objId) =>
    {
      return schemaService.getSchema(schemaName)
        .then(schema => {

          debug('schema', schema)

          const user = authService.authorize(userService.currentUser, schema, 'read');

          const relPath = schemaName.replace(/^content\./, '')+(objId ? addFileExt('/'+objId) : '');

          const data = contentDb.get(relPath);

          maybeThrow(!data, `objId '${objId}' not found`, 404);

          return objId ? data : Object.keys(data);
        });
    },

    setData: (schemaName, objId) =>
    {
      return schemaService.getSchema(req.params.schemaName)
      .then(schema => {

          const user = authService.authorize(userService.currentUser, schema, 'write');

          const data = request.body;

          console.log('schema', schema, data)

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