import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export const isObservable = obs => obs instanceof Observable;


export const ensureObservable = (action) =>
  isObservable(action)
    ? action
    : Observable.from([action]);


export const log = console.log.bind(console);


export const error = console.error.bind(console);

export const upquirePath = function(some_path) {
  return upquire(some_path, { pathOnly: true, dirnameOnly: true })
}


export const composedSubjectBindNext = (subject$, composed$) =>
{
  composed$.next = subject$.next.bind(composed$)
  return composed$
}


export const flushObservable = (observable) =>
{
  observable.subscribe().unsubscribe();
}


export const getStop$ = (debug) =>
{
  let is_stopped = false;

  const subject$ = new Subject();

  Object.defineProperty(subject$, 'isStopped', {
    get: function() {
      return is_stopped;
    }
  });

  subject$.subscribe(() => {
    is_stopped = true;
    subject$.unsubscribe();
    debug && debug('STOPPED!')
  })

  return subject$
}


export const promise = (obs$) =>
// Make a promise of an observable and `take(1)`
// Intended for chai-testing until I figure s.th. better out...
{
  return obs$
    .take(1)
    .toPromise()
}