import chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import Rx from 'rxjs/Rx';
import { flushObservable } from '../lib/utils';
import { jwtRequest } from '../lib/g-drive/jwt';

import * as changes from '../lib/g-drive/changes';

chai.use(chaiAsPromised);
chai.should();

const log = console.log.bind(console);

let res;

// ------- lib/g-drive/changes -------

describe('changes', function() {

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

  describe('primeStartPageToken', function() {

    describe('called with 42 as an argument', function() {
      flushObservable(changes.nextPageToken$)
      let res = changes.primeStartPageToken(42);

      it('should be a promise', function() {
        return res.should.be.a('promise')
      })

      it('should promise the passed pageToken equal to 42', function(done) {
        res.should.eventually.equal(42).notify(done)
      })
    })


    describe('with a storage value of 43, and called without arguments', function() {
      flushObservable(changes.nextPageToken$)
      changes.setStorageStartPageToken(43)
      let res = changes.primeStartPageToken();

      it('should be a promise', function() {
        return res.should.be.a('promise')
      })

      it('should promise the storage pageToken equal to 43', function(done) {
        res.should.eventually.equal(43).notify(done)
      })
    })


    describe('without storage value, and called without arguments', function() {
      flushObservable(changes.nextPageToken$)
      changes.removeStorageStartPageToken
      let res = changes.primeStartPageToken();

      it('should be a promise', function() {
        return res.should.be.a('promise')
      })

      it('should promise a requested pageToken to be a number', function(done) {
        res.should.eventually.be.a('number').notify(done)
      })
    })

  })

  describe('nextPageToken$', function() {

    it('should be an Observable', function() {
      return changes.nextPageToken$ instanceof Rx.Observable;
    })

    it('should implement a next() method', function() {
      return changes.nextPageToken$.next instanceof Function;
    })

  })

  describe('getChanges$', function() {

    let obs$ = changes.getChanges$();

    it('should be an Observable', function() {
      return obs$ instanceof Rx.Observable;
    })

    it('should request changes', function(done) {
      jwtRequest('https://www.googleapis.com/drive/v3/changes/startPageToken')
      .then((res) => {
        // Prime with less than startPageToken to only get some changes
        changes.primeStartPageToken(parseInt(res.startPageToken) - 40)
        .then(pageToken => {
          obs$.toPromise().then(res => {
            //log(res, 'FLEMMING', pageToken)
            expect(res).to.be.an('array').and.not.be.empty ?
              done() :
              done(false);
          })
        })
      })
    });

  })
})
