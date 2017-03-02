import chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import assertArrays from 'chai-arrays';

import Rx from 'rxjs/Rx';
import * as utils from './lib/utils';

const log = console.log.bind(console);

chai.use(assertArrays);
chai.use(chaiAsPromised);
chai.should();

describe('A', function() {

  it('should work', function(done) {

    const list = ['a', 'b', 'c'];

    const obs$ = new Rx.Observable.from(list)
      .take(list.length)
      .bufferCount(list.length)

    utils.promise(obs$)
      .should.eventually.be.equalTo(list)
      .notify(done)

  })

})