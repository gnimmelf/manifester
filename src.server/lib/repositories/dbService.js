const { join } = require('path');
const mkdirp = require('mkdirp').sync;
const Database = require('../db');

const ensureDir = (path) => { mkdirp(path); return path }

module.exports = ({ localAppPath }) =>
{
  return {
    schemas: new Database({ root: ensureDir(join(localAppPath, 'db/schemas')) }),
    users: new Database({ root: ensureDir(join(localAppPath, 'db/users')) }),
    content: new Database({ root: ensureDir(join(localAppPath, 'db/content')) }),
  }
}

