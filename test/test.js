const { join } = require('path');
const osTmpdir = require('os-tmpdir');
const sh = require('shelljs');

const chai = require('chai');
const chaiHttp = require('chai-http');

const manifester = require('../index');
const sourceDir = join(__dirname, '../generators/create-site/templates');
const targetDir = join(osTmpdir(), 'mfs-site');

console.log(sourceDir)
console.log(targetDir)

/*
Chai setup
*/

chai.use(chaiHttp);
const { expect } = chai;

/*
App setup
*/

// Copy the local-app structure
sh.rm('-rf', targetDir);
sh.mkdir(targetDir);
sh.cp('-R', `${sourceDir}/*`, targetDir);

// Run `manifester` on the local-app dir
manifester.use('/', (req, res) => res.send('Test App\n'));
manifester.run({
  localAppPath: targetDir,
  createServer: false,
});


const agent = chai.request.agent(manifester.mainApp)


/*
  Paths
*/
const paths = {
  inspect: '/api/inspect',
  currentUser: '/api/user/current',
  userList: '/api/user/list',
  schemaList: '/api/schema/list',

}

describe('not logged in', () => {

  describe('200/Ok paths', () => {

    ([
      'inspect',
      'schemaList',
    ])
    .map(name => paths[name])
    .forEach(path => {

      it(paths.inspect, async () => {
        const res = await agent.get(paths.inspect);
        expect(res).to.have.status(200);
      });

    });

  });

  describe('401/Unauthorized paths', () => {

    it(paths.currentUser, async () => {
      const res = await agent.get(paths.currentUser)
      expect(res).to.have.status(401);
    });

  });

});
/*
┌────────┬──────────────────────────────────────────────────────────────────┐
│ Method │ url                                                              │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/inspect                                                     │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/inspect/asHtml                                              │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/inspect/asText                                              │
├────────┼──────────────────────────────────────────────────────────────────┤
│ POST   │ /api/auth/request                                                │
├────────┼──────────────────────────────────────────────────────────────────┤
│ POST   │ /api/auth/exchange                                               │
├────────┼──────────────────────────────────────────────────────────────────┤
│ POST   │ /api/auth/authenticate                                           │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/schema/list/:globpattern?/:operation?                       │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/schema/:schemaName                                          │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/user/list                                                   │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/user/current                                                │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/user/current/groups                                         │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/user/logout                                                 │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/user/:userHandle/data/:schemaNameSuffix/list                │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/user/:userHandle/data/:schemaNameSuffix/:objId              │
├────────┼──────────────────────────────────────────────────────────────────┤
│ POST   │ /api/user/:userHandle/data/:schemaNameSuffix/:objId/:dottedPath? │
├────────┼──────────────────────────────────────────────────────────────────┤
│ DELETE │ /api/user/:userHandle/data/:schemaNameSuffix/:objId/:dottedPath? │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/data/content/:schemaNameSuffix/list                         │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/data/content/:schemaNameSuffix/:objId/:dottedPath?          │
├────────┼──────────────────────────────────────────────────────────────────┤
│ POST   │ /api/data/content/:schemaNameSuffix/:objId?/:dottedPath?         │
├────────┼──────────────────────────────────────────────────────────────────┤
│ DELETE │ /api/data/content/:schemaNameSuffix/:objId/:dottedPath?          │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/data/singleton/:dbKey/list/:globpattern?                    │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/data/singleton/:dbKey/:schemaNameSuffix/:dottedPath?        │
├────────┼──────────────────────────────────────────────────────────────────┤
│ POST   │ /api/data/singleton/:dbKey/:schemaNameSuffix/:dottedPath?        │
└────────┴──────────────────────────────────────────────────────────────────┘
*/

