const { join } = require('path');
const mkdirp = require('mkdirp').sync;
const loopWhile = require('deasync').loopWhile;

const Db = require('../../lib/Db');
const {
  loggers
} = require('../../utils');

module.exports = ({ dbRoot }) =>
{

  const logger = loggers.get('default');

  const ensureDir = (dbPath) => {
    logger.verbose('Ensure dbPath', { data :dbPath });
    mkdirp(dbPath); return dbPath
  }

  const dbs = {};
  let done = false;

  Promise.all([
    new Db({
      root: ensureDir(join(dbRoot, 'schemas')),
    }).promise.then(db => dbs['schema'] = db),
    new Db({
      root: ensureDir(join(dbRoot, 'site')),
    }).promise.then(db => dbs['site'] = db),
    new Db({
      root: ensureDir(join(dbRoot, 'users')),
      instantPush: true,
    }).promise.then(db => dbs['user'] = db),
    new Db({
      root: ensureDir(join(dbRoot, 'content')),
    }).promise.then(db => dbs['content'] = db),
  ])
  .then(() => { done = true; })
  .catch(err => err);

  // Loop while not all done
  loopWhile(() => !done);

  logger.verbose('dbService loaded!', { keys: Object.keys(dbs).join(', ') });

  return dbs;
}

