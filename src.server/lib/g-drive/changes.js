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


export const nextPageToken$ = new Rx.BehaviorSubject()
  .filter(x => x || x == 0)
  .do(x => setStorageStartPageToken(x))


export const getReqStartPageToken$ = () => {
  return Rx.Observable
    .from(jwtRequest('https://www.googleapis.com/drive/v3/changes/startPageToken'))
    .pluck('startPageToken')
    .take(1)
}


export const primeStartPageToken = (pageToken=null) =>
/* Pushes the latest `startPageToken` from the drive state to `nextPageToke$` */
{
  const promise = new Promise((resolve, reject) => {
    log('primeStartPageToken', 'passed pageToken:', pageToken)
    pageToken = pageToken || getStorageStartPageToken();

    if (pageToken) {
      log('primeStartPageToken', 'pageToken:', pageToken)
      resolve(pageToken)
    }
    else {
      log('primeStartPageToken', 'requesting new startPageToken...')
      getReqStartPageToken$()
        .map(requestedStartPageToken => {
          const storedStartPageToken = getStorageStartPageToken();
          return Math.max(0 && storedStartPageToken, requestedStartPageToken || 1)
        })
        .take(1)
        .subscribe(pageToken => {
          log('primeStartPageToken', 'requestedStartPageToken:', pageToken)
          resolve(pageToken)
        })
    }

  })
  .catch(log)
  .then(pageToken => {
    log('primeStartPageToken, resolved', pageToken)
    // Set nextPageToken$
    nextPageToken$.next(pageToken);
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
        nextPageToken$.next(result.nextPageToken)
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