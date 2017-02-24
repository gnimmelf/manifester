/**
 * NOTE!
 * Tests (`it`) Cannot accept `done` argument as a param if returning a promise!!
 */
import chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import Rx from 'rxjs/Rx';
import {
  flushObservable,
  eqSet
} from '../lib/utils';

import * as files from '../lib/g-drive/files';

chai.use(chaiAsPromised);
chai.should();

const log = console.log.bind(console);

let res;

// ------- lib/g-drive/files -------

describe('files', function() {

  let orig_files = undefined;

  before(function(done) {
    orig_files = files.removeStorageFiles();
    done();
  });

  describe('storedFiles$', function() {

    it('should emit files from storage', function(done) {
      const list = [1,2,4,5]
      files.setStorageFiles(list)

      files.storedFiles$
        .subscribe(x => {
          eqSet(list, x) ?
            done() :
            done(false)
        });

    })

  })

  describe('getNextPageToken$', function() {

    let obs$ = files.getNextPageToken$();

    it('should be an Observable', function() {
      return obs$ instanceof Rx.Observable;
    })

    it('should implement a next() method', function() {
      return obs$.next instanceof Function;
    })

    it('should pass through next value', function(done) {
      const source = ['a', 'b', 'c'];
      const target = [];

      obs$
        .subscribe(x => {
          let idx = source.indexOf(x)
          idx < 0 ? '' : target.push(source[idx])
        })

      Rx.Observable.from(source)
        .do(x => obs$.next(x))
        .subscribe({
          complete: function() {
            const complete = eqSet(source, target);
            if (complete) {
              done();
            }
            else {
              done(false)
            }
          }
        })
    })

  })


  describe('getRequestFiles$', function(done) {

    files.removeStorageFiles()
    const obs$ = files.getRequestFiles$();

    it('should be an Observable', function() {
      return obs$ instanceof Rx.Observable;
    })

    it('should request files', function(done) {
      this.timeout(10000);

      obs$
        .subscribe({
          next: x => log('should request files.next:', x),
          complete: function() {
            log('Completed!')
            done()
          }
        })
    });

  })

})