const path = require('path');
const jsonpath = require('jsonpath')

// So happy!! https://github.com/VINTproYKT/node-jsondir-livedb
const LiveDB = require('jsondir-livedb');

module.exports = (root_path, options={}) =>
{

  // Ensure superusers
  upquire('/sensitive/credentials/superusers').forEach(superuser => {
    if (!users.get(`${superuser.email}.json`)) {
      users.set(`${superuser.email}.json`, null, superuser);
    }
  });



  options.root = root_path;

  const db = new LiveDB(options);

  // Extend with basic `jsonpath`-methods
  ['query', 'paths', 'nodes', 'value', 'parent', ].forEach(method => {
    db[method] = jsonpath[method].bind(jsonpath, db.tree);
  });

  module.exports = db;
}
