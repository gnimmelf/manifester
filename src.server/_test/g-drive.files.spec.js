/**
 * NOTE!
 * Tests (`it`) Cannot accept `done` argument as a param if returning a promise!!
 */
import chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import assertArrays from 'chai-arrays';

import Rx from 'rxjs/Rx';

import * as utils from '../lib/utils';
import * as files from '../lib/g-drive/files';
import * as changes from '../lib/g-drive/changes';

chai.use(assertArrays);
chai.use(chaiAsPromised);
chai.should();

const log = console.log.bind(console);

// ------- lib/g-drive/files -------

describe('files', function() {

  let orig_files = undefined;

  before(function() {
    files.removeStorageFiles();
  });

  after(function() {
    files.removeStorageFiles()
  })

  describe('storageFiles$', function() {

    it('should emit files from storage if stored', function(done) {
      const list = [1,2,4,5]
      files.setStorageFiles(list)

      utils.promise(files.storageFiles$)
        .should.eventually.be.equalTo(list)
        .notify(done)

    })

    after(function() {
      files.removeStorageFiles()
    })

  })


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
      const count = list.length + 1 // Starts with ''...

      const buffer$ = obs$
        .take(count)
        .bufferCount(count)

      utils.promise(buffer$)
        .should.eventually.be.containingAllOf(list).and.to.be.ofSize(count)
        .notify(done)

      list.forEach(obs$.next)
    })

  })


  describe('getting files', function(done) {

    let requested_files = null;

    describe('reqFiles$', function(done) {

      const obs$ = files.getRequestFiles$();

      it('should be an Observable', function() {
        return obs$ instanceof Rx.Observable;
      })

      it('should request files', function(done) {
        this.timeout(5000);

        obs$
          .subscribe({
            next: files => {
              if (files && files.length) {
                requested_files = files.map(x => files.id);
                done()
              }
              else {
                done(false);
              }
            }
          })
      });

    })

    describe('getFiles$', function() {


      it('should request files if no files in storage', function(done) {
        this.timeout(5000);

        files.removeStorageFiles()

        files.getFiles$()
          .subscribe(files => {
            files && files.length ?
              done() :
              done(false)
          });

      });

/*

      it('should prioritize stored files', function(done) {
        const list = [1,2,4,5]
        files.setStorageFiles(list)

        const subs = files.getFiles$()
          .subscribe(x => {
            eqSet(list, x) ?
              done() :
              done(false)
          });

      })
*/

    })

  })

})