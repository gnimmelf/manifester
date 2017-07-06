const { join } = require('path');
const mkdirp = require('mkdirp').sync;
const Db = require('../Db');

const ensureDir = (path) => { mkdirp(path); return path }

module.exports = ({ localAppPath }) =>
{
  /**
   * Public
   */
  return {
    schemas: new Db({ root: ensureDir(join(localAppPath, 'db/schemas')) }),
    users: new Db({ root: ensureDir(join(localAppPath, 'db/users')) }),
    content: new Db({ root: ensureDir(join(localAppPath, 'db/content')) }),
  }
}

