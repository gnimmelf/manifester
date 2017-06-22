const { join } = require('path');
const mkdirp = require('mkdirp').sync;
const Database = require('../db');

module.exports = ({ localPath }) =>
{
  mkdirp(`${localPath}/db/{schemas, users, content}`);

  return {
    schemas: new Database({ root: join(localPath, 'db/schemas') }),
    users: new Database({ root: join(localPath, 'db/users') }),
    content: new Database({ root: join(localPath, 'db/content') }),
  }
}

