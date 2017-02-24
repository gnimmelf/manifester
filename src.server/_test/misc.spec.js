import chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import Rx from 'rxjs/Rx';

import storage from '../lib/storage';
import { jwtRequest } from '../lib/g-drive/jwt';

chai.use(chaiAsPromised);
chai.should();

const log = console.log.bind(console);

let res;

// ------- lib/storage -------

describe('storage', () => {
  it('should store an item', () => {
    storage.setItemSync('chai-test', {a: 1, b: 2})
  })

  it('should retrieve an item', () => {
    storage.getItemSync('chai-test').should.have.property('b').equal(2)
  })

  it('should remove an item', () => {
    storage.removeItemSync('chai-test')
    expect(storage.getItemSync('chai-test')).to.not.exist;
  })
})

// ------- lib/g-drive/jwt -------

describe('jwtRequest', () => {

  res = jwtRequest('https://www.googleapis.com/drive/v3/changes/startPageToken')

  it('should be a promise', () => {
    return res instanceof Promise
  })

  it('should resolve with request-result as json', () => {
    res.should.eventually.have.deep.property('startPageToken')
  })
})
