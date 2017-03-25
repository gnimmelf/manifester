import _debug from 'debug';
import chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import Rx from 'rxjs/Rx';
import { jwtRequest } from './lib/g-drive/jwt';

import * as utils from './lib/utils';

import * as changes from './lib/g-drive/changes';
import * as files from './lib/g-drive/files';

chai.use(chaiAsPromised);
chai.should();

const debug = _debug('lib:snippets');

const log = console.log.bind(console)

const query = "'0B4gB3nV9reGKWURSdDdWeGdBU1k' in parents"

files.removeStorageFiles()

describe('snippet', function() {
  this.timeout(10000);

  it('should work', function(done) {

    const file$ = files.default(query)
    // <-- START HERE! What goes here to collect all emmissions into an array?


    // log(file$)

    file$
      .subscribe({
        next: x => {
          log('RESULT')
          log('x', x)
        },
        error: log,
        complete: () => {
          log('COMPLETE')
          done();
        }
      })

  })

})

// changes.getRequestChanges$()
//   .subscribe(log)

// changes.setNextPageToken(100);
