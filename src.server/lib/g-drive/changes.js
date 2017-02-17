import _debug from 'debug';
import Rx from 'rxjs/Rx';
import { jwtRequest } from './jwt';
import storage from '../storage';
import { log } from '../utils';

const debug = _debug('lib:g-drive:changes');

const setStartPageToken = (x) => storage.setItemSync('changesStartPageToken', x);
const getStartPageToken = () => storage.getItemSync('changesStartPageToken');

const nextPageToken$ = new Rx.Subject()
  .filter(x => x || x == 0)
  .do(x => setStartPageToken(x))

export const newStartPageToken = (pageToken=null) =>
/* Pushes the latest `startPageToken` from the drive state to `nextPageToke$`*/
{
  let promise;

  if (pageToken) {
    nextPageToken$.next(pageToken)
    promise = new Promise((resolve) => resolve(pageToken))
  }
  else {
    promise = Rx.Observable
      .from(jwtRequest('https://www.googleapis.com/drive/v3/changes/startPageToken'))
      .pluck('startPageToken')
      .do(nextPageToken$.next)
      .toPromise()
  }
  return promise;
}

export const getChanges$ = () =>
{
  const flushBuffer$ = new Rx.Subject();

  const changes$ = nextPageToken$
    .switchMap(pageToken => {
      return jwtRequest({
        url: 'https://www.googleapis.com/drive/v3/changes',
        qs: {
          pageToken: pageToken,
          pageSize: 5,
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
        setStartPageToken(result.newStartPageToken);
        // Signal buffer to flush changes
        flushBuffer$.next();
      }
    })
    .mergeMap(result => result.changes)
    .takeUntil(flushBuffer$)
    .do(x => debug(`gPageToken ${gPageToken}`, 'changes:', x))

  return changes$;
}

/*
reqChanges$().subscribe({
  next: (x) => {
    log(`gPageToken: ${gPageToken}`)
    log(`Changes:\n`, x)
  }
});
*/