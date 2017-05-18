/**
 * NOTE!
 * `it`-tests cannot accept `done` argument as a param if returning a promise!!
 */
import chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import Rx from 'rxjs/Rx';

import * as utils from '../lib/utils';
import * as files from '../lib/g-drive/files';

chai.use(chaiAsPromised);
chai.should();

const log = console.log.bind(console);

// ------- lib/g-drive/files -------

describe('files', function() {

  describe('getNextPageToken$', function() {

    let obs$ = files.getNextPageToken$();

    it('should be an Observable', function() {
      return obs$ instanceof Rx.Observable;
    })

    it('should implement a next() method', function() {
      obs$.next.should.be.a('function');
    })

    it('should pass through next value', function(done) {

      const list = ['a', 'b', 'c']
      const count = list.length + 1 // Starts emitting a blank

      const buffer$ = obs$
        .take(count)
        .bufferCount(count)

      utils.promise(buffer$)
        .should.eventually.include.members(list).and.have.lengthOf(count)
        .notify(done)

      list.forEach(x => obs$.next(x))
    })

  })


  describe('getting files', function() {

    const query = "'0B4gB3nV9reGKWURSdDdWeGdBU1k' in parents and trashed = false and name contains '*.md'"

    describe('promisedFiles', function() {

      const promise = files.promisedFiles(query);

      it('should be promise', function() {
        return promise instanceof Promise;
      })

      it('should promise files', function(done) {
        this.timeout(5000);

        promise
          .should.eventually.be.an('array')
          .notify(done)

      });
    })

  })

})