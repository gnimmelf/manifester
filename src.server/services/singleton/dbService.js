const { join } = require('path');
const mkdirp = require('mkdirp').sync;
const loopWhile = require('deasync').loopWhile;

const Db = require('../../lib/Db');
const {
  loggers
} = require('../../utils');

const ensureDir = (path) => { mkdirp(path); return path }

module.exports = ({ dbPath }) =>
{
  const logger = loggers.get('default');

  const dbs = {};
  let done = false;

  Promise.all([
    new Db({
      root: ensureDir(join(dbPath, 'schemas')),
    }).promise.then(db => dbs['schema'] = db),
    new Db({
      root: ensureDir(join(dbPath, 'site')),
    }).promise.then(db => dbs['site'] = db),
    new Db({
      root: ensureDir(join(dbPath, 'users')),
      instantPush: true,
    }).promise.then(db => dbs['user'] = db),
    new Db({
      root: ensureDir(join(dbPath, 'content')),
    }).promise.then(db => dbs['content'] = db),
  ])
  .then(() => { done = true; })
  .catch(err => err);

  // Loop while not all done
  loopWhile(() => !done);

  logger.info('dbServices loaded:', Object.keys(dbs).join(', '));

  return dbs;
}

