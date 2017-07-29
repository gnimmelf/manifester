const { join } = require('path');
const mkdirp = require('mkdirp').sync;
const loopWhile = require('deasync').loopWhile;
const Db = require('../Db');



const ensureDir = (path) => { mkdirp(path); return path }

module.exports = ({ localAppPath }) =>
{
  const services = {};
  let done = false;

  Promise.all([
    new Db({
      root: ensureDir(join(localAppPath, 'db/schemas')),
    }).promise.then(db => services['schemas'] = db),
    new Db({
      root: ensureDir(join(localAppPath, 'db/users')),
      instantPush: true,
    }).promise.then(db => services['users'] = db),
    new Db({
      root: ensureDir(join(localAppPath, 'db/content')),
    }).promise.then(db => services['content'] = db),
  ])
  .then(() => { done = true; })
  .catch(err => err);

  // Loop while not all done
  loopWhile(() => !done);

  console.log('dbServices loaded!', Object.keys(services))

  return services;
}

