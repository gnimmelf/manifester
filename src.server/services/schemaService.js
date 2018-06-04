const debug = require('debug')('mf:service:schemaService');
const { join, relative } = require('path');
const assert = require('assert');
const { maybeThrow, inspect, addFileExt } = require('../lib');
const $RefParser = require('json-schema-ref-parser');


const minimatch = require('minimatch');

const cache = {};

const getRelFsPath = (fsPath) => relative(process.cwd(), fsPath);

const invalidateCache = (fsPath) => {
  fsPath = getRelFsPath(fsPath);
  debug("removed from cache", fsPath);
  delete cache[fsPath];
};

module.exports = ({ dbService, userService }) =>
/*
  IMPORTANT!
  `getSchema` *must* dereference relative on the filesystem, and `getSchemaNames` *must* use the `dbService`.
  1. If `getSchema` dereferencing (`$RefParser`) uses the `dbService`, the `cwd` will not match relative schema-paths.
  2. This also makes the schemas starting with `.` hidden, but parsable due to the `ignored: /(^|[\/\\])\../` db-setting behind `dbService`
*/
{
  const schemaDb = dbService.schema;

  schemaDb.watcher.on('change', invalidateCache);
  schemaDb.watcher.on('unlink', invalidateCache);

  return {

    getSchema: (schemaName, operation='read') =>
    {
      return new Promise((resolve, reject) => {
        schemaName = addFileExt(schemaName, ".json");

        maybeThrow(!schemaDb.get(schemaName), `Schema '${schemaName}' not found`, 404)

        const fsPath = getRelFsPath(join(schemaDb.root, schemaName));

        if (cache[fsPath]) {
          resolve(cache[fsPath]);
        }
        else {
          $RefParser.dereference(fsPath)
            .then(schema => {

              // Force no additional properties
              schema.additionalProperties = false,

              // Validate `schema`
              // TODO! Make properly: required ["ACL", "title", "idProperty"]
              maybeThrow(schema.idProperty == undefined, `Invalid schema: No 'idProperty' found on '${schemaName}'`, 424);

              cache[fsPath] = schema;
              debug("added to cache", fsPath);
              resolve(schema);

            })
            .catch(err => reject(err));
        }
      })
      .then(schema => {
        userService.authorizeByACL(schema.ACL, operation);
        return schema;
      });
    },

    getSchemaNames: (globpattern='*', operation='read') =>
    {
      return new Promise((resolve, reject) => {
        const schemaNames = Object.entries(schemaDb.tree)
          .filter(([schemaName, schema]) => minimatch(schemaName, globpattern))
          .filter(([schemaName, schema]) => userService.authorizeByACL(schema.ACL, operation, {supressError: true}))
          .map(([schemaName, schema]) => schemaName);

        schemaNames.sort();

        resolve(schemaNames)
      });
    },

  }
};