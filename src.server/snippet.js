const upquire = require('upquire');
const upquirePath = upquire('/lib/utils').upquirePath;
const generateCode = upquire('/lib/utils/code-gen');

const db = upquire('/lib/json-tree')(upquirePath('/sensitive', 'db/users'), {
  instantPush: true,
});

//db.set('gnimmelf@gmail.com.json', 'loginCode', 'aaaaaa');