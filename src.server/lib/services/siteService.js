const debug = require('debug')('services:siteService');
const { join, relative } = require('path');
const assert = require('assert');
const { maybeThrow, inspect, addFileExt } = require('../');
const jp = require('jsonpath');
const minimatch = require('minimatch');

// TODO! Cach `siteService.getSettings()` as `settings`

module.exports = ({ dbService }) =>
{
  const siteDb = dbService.site;

  return {
    get settings() {
      const settings = siteDb.get('settings.json');
      maybeThrow(!settings, `could not get site settings!`);
      return settings;
    }
  };
};