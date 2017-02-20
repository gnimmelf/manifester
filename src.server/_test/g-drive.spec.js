import chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import Rx from 'rxjs/Rx';

import storage from '../lib/storage';
import { jwtRequest } from '../lib/g-drive/jwt';
import * as changes from '../lib/g-drive/changes';

chai.use(chaiAsPromised);
chai.should();

const log = console.log.bind(console);

let res;

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

  res = jwtRequest('https://www.googleapis.com/drive/v3/changes/startPageToken')

  it('should be a promise', () => {
    return res instanceof Promise
  })

  it('should resolve with request-result as json', () => {
    res.should.eventually.have.deep.property('startPageToken')
  })
})

const flushObservable = (observable) => {
  observable.subscribe().unsubscribe();
}

// ------- CHANGES -------

describe('changes', () => {
  describe('primeStartPageToken', () => {

    let orig_pageToken = undefined;

    before(function(done) {
      orig_pageToken = changes.removeStorageStartPageToken()
      done();
    });


    after(function(done) {
      if (orig_pageToken) {
        changes.setStorageStartPageToken(orig_pageToken);
        console.log('changes: restored stored startPageToken', orig_pageToken)
      }
      // Flush the queue
      flushObservable(changes.nextPageToken$)
      done();
    });


    describe('called with 42 as an argument', () => {
      flushObservable(changes.nextPageToken$)
      let res = changes.primeStartPageToken(42);

      it('should be a promise', () => {
        return res.should.be.a('promise')
      })

      it('should promise the passed pageToken equal to 42', (done) => {
        res.should.eventually.equal(42).notify(done)
      })
    })


    describe('with a storage value of 43, and called without arguments', () => {
      flushObservable(changes.nextPageToken$)
      changes.setStorageStartPageToken(43)
      let res = changes.primeStartPageToken();

      it('should be a promise', () => {
        return res.should.be.a('promise')
      })

      it('should promise the storage pageToken equal to 43', (done) => {
        res.should.eventually.equal(43).notify(done)
      })
    })


    describe('without storage value, and called without arguments', () => {
      flushObservable(changes.nextPageToken$)
      changes.removeStorageStartPageToken
      let res = changes.primeStartPageToken();

      it('should be a promise', () => {
        return res.should.be.a('promise')
      })

      it('should promise a requested pageToken to be a number', (done) => {
        res.should.eventually.be.a('number').notify(done)
      })
    })

  })

  describe('nextPageToken$', () => {

    it('should be an Observable', () => {
      return changes.nextPageToken$ instanceof Rx.Observable;
    })

  })

  describe('getChanges$', () => {

    let obs$ = changes.getChanges$();

    it('should be an Observable', () => {
      return obs$ instanceof Rx.Observable;
    })

    it('should request changes', (done) => {
      changes.primeStartPageToken(150);

      obs$.toPromise().should.eventually.be.an('array').notify(done);
    });


    /*
    res = new Promise((resolve) => {})

    */
  })
})