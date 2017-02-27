import Rx from 'rxjs/Rx';
import { log } from './lib/utils'


const changes$ = Rx.Observable.from(['a'])

Rx.Observable.from([1,2,3,4]).withLatestFrom(changes$)
  .subscribe(x => { log('x', x) })