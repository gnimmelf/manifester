import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import dotProp from 'dot-prop';
import upquire from 'upquire';

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

export const httpGet = (url) =>
{
  // https://www.tomas-dvorak.cz/posts/nodejs-request-without-dependencies/
  // return new pending promise
  return new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const lib = url.startsWith('https') ? require('https') : require('http');
    const request = lib.get(url, (response) => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + response.statusCode));
       }
      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on('end', () => resolve(body.join('')));
    });
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
    })
};


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

const interpolation_re = /{([^}]+)}/g;
const interpolate = (string, data, missing='MISSING DATA') => {

  const matches = string.match(re)

  matches.map((match => {
    let dot_path = match.replace(/\s|\{|\}/g, '');
    let value = dotProp.get(data, dot_path);
    console.log(match, value)
    string = string.replace(match, value, missing)
  }));

  return string
}

export const promise = (obs$) =>
// Make a promise of an observable and `take(1)`
// Intended for chai-testing until I figure s.th. better out...
{
  return obs$
    .take(1)
    .toPromise()
}

export const eqSet = (set_a, set_b) =>
{
  set_a instanceof Set ? null : set_a = new Set(set_a);
  set_b instanceof Set ? null : set_b = new Set(set_b);
  return set_a.size === set_b.size && all(isIn(set_b), set_a);
}


export const all = (pred, set_a) =>
{
  for (var a of set_a) if (!pred(a)) return false;
  return true;
}


export const isIn = (set_a) =>
{
  return function (a) {
    return set_a.has(a);
  };
}