import chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import Rx from 'rxjs/Rx';
import { flushObservable } from '../lib/utils';
import { jwtRequest } from '../lib/g-drive/jwt';

import * as utils from '../lib/utils';

import * as changes from '../lib/g-drive/changes';
import * as files from '../lib/g-drive/files';

chai.use(chaiAsPromised);
chai.should();

const log = console.log.bind(console);

// ------- lib/g-drive/changes -------

describe('changes', function() {

  let orig_pageToken = undefined;

  before(function() {
    changes.removeStorageStartPageToken()
    files.removeStorageFiles()
  });

  after(function() {
    changes.removeStorageStartPageToken()
    files.removeStorageFiles()
  })

  describe('getReqStartPageToken$', function() {

    const obs$ = changes.getReqStartPageToken$();

    it('should be an observable', function() {
      return obs$ instanceof Rx.Observable;
    })

    it('should be a number', function(done) {

      utils.promise(obs$.map(parseInt))
        .should.eventually.be.a('number')
        .notify(done)
    })

  })


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


    describe('with a storage value of 9999, and called without arguments', function() {
      flushObservable(changes.nextPageToken$)
      changes.setStorageStartPageToken(9999)

      let res = changes.primeStartPageToken();

      it('should be a promise', function() {
        return res.should.be.a('promise')
      })

      it('should promise the storage pageToken equal to 9999', function(done) {
        res.should.eventually.equal(9999).notify(done)
      })

       after(function() {
        changes.removeStorageStartPageToken()
          files.removeStorageFiles()
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


  describe('setNextPageToken', function() {

    it('should store the pageToken and emit it from nextPageToken$', function(done) {

      flushObservable(changes.nextPageToken$)
      changes.removeStorageStartPageToken

      let stored_page_token;
      const obs$ = changes.nextPageToken$
        .do(() => {
          stored_page_token = changes.getStorageStartPageToken()
        })

      changes.setNextPageToken(44)

      utils.promise(obs$)
        .should.eventually.be.equal(44).and.be.equal(stored_page_token)
        .notify(done)

    })

  })


  describe('getRequestChanges$', function() {

    flushObservable(changes.nextPageToken$)
    changes.removeStorageStartPageToken

    let obs$ = changes.getRequestChanges$();

    it('should be an Observable', function() {
      return obs$ instanceof Rx.Observable;
    })

    it('should request changes', function(done) {
      this.timeout(5000);

      utils.promise(changes.getReqStartPageToken$())
        .then(pageToken => {
          // Prime with less than startPageToken to only get some changes
          return changes.primeStartPageToken(parseInt(pageToken) - 40)
        })
        .then(pageToken => {
          utils.promise(obs$)
            .should.eventually.be.an('array').and.not.be.empty
            .notify(done)
        })

    });

  })
})
