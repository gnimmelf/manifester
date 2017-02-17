import chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import Rx from 'rxjs/Rx';

import storage from '../lib/storage';
import { jwtRequest } from '../lib/g-drive/jwt';
import {
  newStartPageToken,
  getChanges$
} from '../lib/g-drive/changes';

chai.use(chaiAsPromised);
chai.should();

const log = console.log.bind(console);

// ------- STORAGE -------

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

// ------- JWTREQUEST -------

describe('jwtRequest', () => {
  it('should resolve with request-result as json', () => {
    jwtRequest('https://www.googleapis.com/drive/v3/changes/startPageToken')
      .should.eventually.have.deep.property('startPageToken')
    })
})

// ------- CHANGES -------

describe('changes', () => {
  describe('newStartPageToken', () => {

    let promise = newStartPageToken();

    it('should be promise', () => {
      return promise instanceof Promise
    })

    it('should return a pageToken', () => {
      promise.should.eventually.be.a('number')
    })
  })

  describe('getChanges$', () => {

    let obs = getChanges$();

    it('should be an instanceof Rx.Subject', () => {
      return obs instanceof Rx.Subject
    })

    it('should push changes', () => {
      newStartPageToken()
      obs.subscribe((x) => {
        log(x)
      })
    })

  })
})