import Rx from 'rxjs/Rx';

import { log } from './lib/utils';


// `value/getValue` is not present after applying instance methods
// https://github.com/ReactiveX/rxjs/issues/2378
let lastValue;

const s1$ = new Rx.Subject()
  .mapTo(0)
  .do(x => log('s1$:', x))


const s2$ = new Rx.Subject()
  .filter((x) => parseInt(x))
  .distinctUntilChanged()
  .do(x => lastValue = x)
  .do(x => log('s2$:', x))

const execute = () => {
  const end$ = new Rx.Subject();

  const m$ = Rx.Observable.merge(s1$, s2$)
    .do((x) => log('m$', x))
    .mergeMap((x) => {
      return new Promise((resolve, reject) => {

        if (!x || x%4) {
          setTimeout(() => { s2$.next(x+1) }, 10)
          resolve({x: x})
        }
        else {
          end$.next('');
          log('m$ Completed')
        }
      })
    });

  m$.takeUntil(end$)
    .subscribe({ complete: () => console.log('m$ got a complete notification') });

  return m$
}

export const run = () => {
  execute()
  s1$.next('kick off')
}

run()