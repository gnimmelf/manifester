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


  describe('getting files', function() {

    let requested_files = null;

    describe('reqFiles$', function() {

      const obs$ = files.getRequestFiles$();

      it('should be an Observable', function() {
        return obs$ instanceof Rx.Observable;
      })

      it('should request files', function(done) {
        this.timeout(5000);

        utils.promise(obs$)
          .then(files => {
            requested_files = files;
            return files
          })
          .should.eventually.be.an('array').and.not.be.empty
          .notify(done)

      });

    })

    describe('getFiles$', function() {

      const obs$ = files.getFiles$();

      it('should be an Observable', function() {
        return obs$ instanceof Rx.Observable;
      })

      it('should prioritize stored files', function(done) {
        const fake_files = [1,2,4,5]

        files.setStorageFiles(fake_files)

        utils.promise(obs$)
          .then(files => {
            log('A', files)
            files.removeStorageFiles()
            return files
          })
          .should.eventually.be.an('array').and.not.be.equalTo(fake_files)
          .notify(done)

      })

/*
      it('should request files if no files in storage', function(done) {
        this.timeout(5000);

        files.removeStorageFiles()

        utils.promise(obs$)
          .should.eventually.be.an('array').and.be.equalTo(requested_files)
          .notify(done)

      });
*/
    })

  })

})