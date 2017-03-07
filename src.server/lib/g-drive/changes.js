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
    .do(x => debug('getReqStartPageToken$', x))
    .pluck('startPageToken')
    .map(x => parseInt(x))
    .take(1)
}

export const primeStartPageToken = (pageToken=null) =>
/* Pushes the latest `startPageToken` from the drive state to `nextPageToke$` */
{
  const debug = _debug('lib:g-drive:changes:primeStartPageToken');

  const promise = new Promise((resolve, reject) => {

    if (pageToken) {
      debug('passed pageToken', pageToken)
      resolve(pageToken)
    }
    else {
      const storedPageToken = getStorageStartPageToken();

      debug('stored PageToken', storedPageToken)
      debug('requesting new startPageToken...')

      getReqStartPageToken$().subscribe(requestedPageToken => {
        debug('(max) stored/requested pageToken', storedPageToken, requestedPageToken)

        const pageToken = Math.max((parseInt(storedPageToken) ? storedPageToken : 0), (requestedPageToken ? requestedPageToken : 1))

        resolve(pageToken)
      })
    }

  })
  //.catch(log)
  .then(pageToken => {
    debug('setNextPageToken', pageToken)
    setNextPageToken(pageToken);
    // Return value to resolve
    return pageToken;
  })

  return promise;
}


export const getRequestChanges$ = () =>
{
  const debug = _debug('lib:g-drive:changes:getRequestChanges');

  const stop$ = new Rx.Subject();

  const changes$ = Rx.Observable.from(nextPageToken$)
    .do(x => debug('requesting changes', 'pageToken:', x))
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
