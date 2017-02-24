import Rx from 'rxjs/Rx';
import { log } from './lib/utils'

const obs$ = Rx.Observable.from([])
log('obs$', obs$.constructor.name)

const tmp$ = new Rx[obs$.constructor.name]();
log('tmp$', tmp$.constructor.name)

export const getNextPageToken$ = () => {
  const orig$ = new Rx.BehaviorSubject();

  const op$ = orig$
    .startWith('')
    .filter(x => x || x === '')

  op$.next = orig$.next.bind(orig$)
  return op$
}

const stream$ = getNextPageToken$()

stream$.subscribe(x => log('next:', x))


stream$.next('a')
stream$.next(0)
stream$.next('b')
stream$.next('')
stream$.next('c')