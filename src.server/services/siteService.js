const debug = require('debug')('mf:service:siteService');
const { join, relative } = require('path');
const assert = require('assert');
const { maybeThrow } = require('../lib');
const jsonPath = require('jsonpath');
const minimatch = require('minimatch');

module.exports = ({ dbService }) =>
{
  const siteDb = dbService.site;
  const userDb = dbService.user;

  return {

    getGroups: () =>
    {
      const groups = jsonPath.nodes(userDb.get('groups.json'), "$[*].name")
        .map(({path, value}) => ({key: path[1], name: value}));

      return groups;
    },


    getObj: (reSchemaNameMask, {schemaName, objId, dottedPath}, owner=null) =>
    // TODO! Fixme! Singleton, one data-file per schema
    {
      debug('getObj', data)
    },

    createObj: (reSchemaNameMask, data, {schemaName}, owner=null) =>
    // TODO! Fixme! Singleton, one data-file per schema
    {
      debug('createObj', data)
    }
  };
};