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
  listenOnPort: 3001,
});


const agent = chai.request.agent('http://localhost:3001')

/*
Tests
*/

const paths = {
  root: '/',
  currentUser: '/api/user/current',
}

describe('paths', () => {

  it(`"${paths.currentUser}"" should return 401`, async () => {

    const res = await agent.get(paths.currentUser)
    expect(res).to.have.status(401);

  });

  it(`"${paths.root}"" should return 200`, async () => {

    const res = await agent.get(paths.root);
    expect(res).to.have.status(200);


  });


})


