const upquire = require('upquire');
const mkdirp = require('mkdirp');
const path = require('path');
const jsonpath = require('jsonpath')

// So happy!! https://github.com/VINTproYKT/node-jsondir-livedb
const LiveDB = require('jsondir-livedb');

module.exports = (root_path, options={}) =>
{
  mkdirp.sync(root_path);

  options.root = root_path;

  const db = new LiveDB(options);

  // Extend with basic `jsonpath`-methods
  ['query', 'paths', 'nodes', 'value', 'parent', ].forEach(method => {
    db[method] = jsonpath[method].bind(jsonpath, db.tree);
  });

  return db;
}
