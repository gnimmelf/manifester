const debug = require('debug')('mf:service:siteService');
const { join, relative } = require('path');
const assert = require('assert');
const { maybeThrow } = require('../lib');
const jsonPath = require('jsonpath');
const minimatch = require('minimatch');

module.exports = ({ dbService }) =>
{
  const siteDb = dbService.site;
  const userDb = dbService.users;

  return {
    getSettings() {
      const settings = siteDb.get('settings.json');
      maybeThrow(!settings, `could not get site settings!`);
      return settings;
    },

    getGroups: () =>
    {
      const groups = jsonPath.nodes(userDb.get('groups.json'), "$[*].name")
        .map(({path, value}) => ({key: path[1], name: value}));

      return groups;
    },
  };
};