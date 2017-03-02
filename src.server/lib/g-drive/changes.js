import _debug from 'debug';
import Rx from 'rxjs/Rx';
import { jwtRequest } from './jwt';
import storage from '../storage';
import { log } from '../utils';

const debug = _debug('lib:g-drive:changes');

const storage_key = 'changesStartPageToken';
export const setStorageStartPageToken = (x) => storage.setItemSync(storage_key, parseInt(x));
export const getStorageStartPageToken = () => parseInt(storage.getItemSync(storage_key)) || undefined;
export const removeStorageStartPageToken = () => parseInt(storage.removeItemSync(storage_key)) || undefined;

export const setNextPageToken = (pageToken) => {
  debug('setNextPageToken', 'pageToken:', pageToken)
  setStorageStartPageToken(pageToken);
  nextPageToken$.next(pageToken);
}

export const nextPageToken$ = new Rx.BehaviorSubject()
  .filter(x => x || x == 0)


export const getReqStartPageToken$ = () => {
  return Rx.Observable
    .from(jwtRequest('https://www.googleapis.com/drive/v3/changes/startPageToken'))
    .pluck('startPageToken')
    .map(x => parseInt(x))
    .take(1)
}

export const primeStartPageToken = (pageToken=null) =>
/* Pushes the latest `startPageToken` from the drive state to `nextPageToke$` */
{
  const promise = new Promise((resolve, reject) => {

    if (pageToken) {
      debug('primeStartPageToken', 'passed pageToken:', pageToken)
      resolve(pageToken)
    }
    else {
      debug('primeStartPageToken', 'requesting new startPageToken...')

      const storedPageToken = getStorageStartPageToken();

      const source$ = getReqStartPageToken$()
        .map(requestedPageToken => {

          debug('primeStartPageToken', 'stored PageToken:', storedPageToken, ', requested PageToken:', requestedPageToken)

          return Math.max((parseInt(storedPageToken) ? storedPageToken : 0), (requestedPageToken ? requestedPageToken : 1))
        })

      source$.subscribe(pageToken => {
        debug('primeStartPageToken', 'requestedPageToken:', pageToken)
        resolve(pageToken)
      })
    }

  })
  .catch(log)
  .then(pageToken => {
    debug('primeStartPageToken, resolved and setting next', pageToken)
    setNextPageToken(pageToken);
    // Return value to resolve
    return pageToken;
  })

  return promise;
}


export const getRequestChanges$ = () =>
{
  const stop$ = new Rx.Subject();

  const changes$ = Rx.Observable.from(nextPageToken$)
    .switchMap(pageToken => {
      return jwtRequest({
        url: 'https://www.googleapis.com/drive/v3/changes',
        qs: {
          pageToken: pageToken,
          pageSize: storage.getItemSync('pageSize') || 5,
        }
      }, {raw_body: true})
    })
    .do(result => {
      if (result.nextPageToken) {
        // Request next page of changes
        setNextPageToken(result.nextPageToken)
      }
    })
    .do(result => {
      if (result.newStartPageToken) {
        // Prime next changes request
        primeStartPageToken(result.newStartPageToken);
        // Signal buffer to flush changes
        stop$.next();
      }
    })
    .mergeMap(result => result.changes)
    .takeUntil(stop$)
    .buffer(stop$)

  return changes$;
}


/*
primeStartPageToken(140);

// DO

reqChanges$().toPromise().then(res => {
  log(res, 'FLEMMING')
})

// OR

reqChanges$().subscribe({
  next: (x) => {
    log(`Changes:\n`, x)
  },
  complete: () => log('Completed!')
});
*/