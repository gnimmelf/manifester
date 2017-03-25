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
import * as changes from '../lib/g-drive/changes';

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
        .should.eventually.be.deep.equal(list)
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
      const count = list.length + 1 // Starts emitting a blank

      const buffer$ = obs$
        .take(count)
        .bufferCount(count)

      utils.promise(buffer$)
        .should.eventually.include.members(list).and.have.lengthOf(count)
        .notify(done)

      list.forEach(obs$.next)
    })

  })


  describe('getting files', function() {

    const query = "'0B4gB3nV9reGKWURSdDdWeGdBU1k' in parents and trashed = false and name contains '*.md'"

    let directly_requested_files = null;

    describe('getRequestFiles$', function() {

      const obs$ = files.getRequestFiles$(query);

      it('should be an Observable', function() {
        return obs$ instanceof Rx.Observable;
      })

      it('should request files', function(done) {
        this.timeout(5000);

        utils.promise(obs$)
          .then(files => {
            directly_requested_files = files;
            return files
          })
          .should.eventually.be.an('array').and.not.be.empty
          .notify(done)

      });

    })

    describe('getFiles$', function() {

      it('should be an Observable', function() {
        const obs$ = files.getFiles$();
        return obs$ instanceof Rx.Observable;
      })

/*
      it('should prioritize stored files', function(done) {
        this.timeout(5000);

        files.setStorageFiles(directly_requested_files)

        const obs$ = files.getFiles$();

        const p = utils.promise(obs$)
          .then(files => {
            log('A', files)
            return files
          })
          .should.eventually.be.an('array').and.not.be.deep.equal(fake_files)
          .notify(done)

          log(p)

        after(function() {
          files.removeStorageFiles()
        })

      })
*/


      it('should request files if no files in storage', function(done) {
        this.timeout(5000);

        files.removeStorageFiles()
        changes.removeStorageStartPageToken()

        const obs$ = files.getFiles$();

        utils.promise(obs$)
          .should.eventually.be.an('array').and.to.deep.have.members(directly_requested_files)
          .notify(done)

      });
    })

  })

})