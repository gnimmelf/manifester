const debug = require('debug')('services:schemaService');
const { join, relative } = require('path');
const assert = require('assert');
const { maybeThrow, inspect, addFileExt } = require('../');
const jp = require('jsonpath');
const $RefParser = require('json-schema-ref-parser');
const minimatch = require('minimatch');

const cache = {};

const getRelFsPath = (fsPath) => relative(process.cwd(), fsPath);

const invalidateCache = (fsPath) => {
  fsPath = getRelFsPath(fsPath);
  debug("removed from cache", fsPath);
  delete cache[fsPath];
};

module.exports = ({ dbService }) =>
{
  const schemaDb = dbService.schemas;

  schemaDb.watcher.on('change', invalidateCache);
  schemaDb.watcher.on('unlink', invalidateCache);

  return {

    getSchema: (schemaName) =>
    {
      return new Promise((resolve, reject) => {
        schemaName = addFileExt(schemaName, ".json");

        maybeThrow(!schemaDb.get(schemaName), `Schema '${schemaName}' not found`, 404)

        // Get it relative on the filesystem, otherwise `$RefParser` can't dereference it...
        const fsPath = getRelFsPath(join(schemaDb.root, schemaName));

        if (!cache[fsPath]) {
          debug("added to cache", fsPath);
          cache[fsPath] = $RefParser.dereference(fsPath);
        }

        resolve(cache[fsPath]);
      });
    },

    getSchemaNames: (globpattern="*") =>
    {
      return new Promise((resolve, reject) => {
        const schemaNames = Object.keys(schemaDb.tree).filter(schemaName => minimatch(schemaName, globpattern));

        resolve(schemaNames)
      });
    },

  }
};