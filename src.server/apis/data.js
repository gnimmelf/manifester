const debug = require('debug')('mf:api:data');
const { maybeThrow, sendApiResponse, requestFullUrl, addFileExt } = require('../lib');

module.exports = ({ dbService, schemaService, authService, userService }) =>
{

  const contentDb = dbService.content;



  return {

    getData: (req, res) => {

      schemaService.getSchema(req.params.schemaName)
      .then(schema => {

        debug('schema', schema)

        const user = authService.authorize(userService.currentUser, schema, 'read');

        const fileId = req.params.fileId;

        const relPath = req.params.schemaName.replace(/^content\./, '')+(fileId ? addFileExt('/'+req.params.fileId) : '');

        const data = contentDb.get(relPath);

        maybeThrow(!data, `FileId '${fileId}' not found`, 404);

        return fileId ? data : Object.keys(data);
      })
      .then(data => {
        sendApiResponse(res, data)
      })
      .catch(err => {
        sendApiResponse(res, err)
      });

    },

    setData: (req, res) => {

      schemaService.getSchema(req.params.schemaName)
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
      })
      .then(data => {
        sendApiResponse(res, data)
      })
      .catch(err => {
        sendApiResponse(res, err)
      });

    },
  };
};