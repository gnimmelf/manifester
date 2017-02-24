import _debug from 'debug';
import Rx from 'rxjs/Rx';
import { normalize } from 'path';
import storage from '../storage';
import { log } from '../utils';
import { jwtRequest } from './jwt';
import {
  primeStartPageToken as changesPrimeStartPageToken,
  getChanges$
} from './changes';

const debug = _debug('lib:g-drive:files');

export const setStorageFiles = (x) => storage.setItemSync('files', (x && x.length ? x : undefined));
export const getStorageFiles = () => { return storage.getItemSync('files') || undefined };
export const removeStorageFiles = (x) => { return storage.removeItemSync('changesStartPageToken') || undefined };


export const storedFiles$ = new Rx.BehaviorSubject()
  .map(getStorageFiles)
  .filter(files => files && files.length)


export const getNextPageToken$ = () => {
  const subject$ = new Rx.BehaviorSubject();

  const composed$ = subject$
    .startWith('')
    .filter(x => x || x === '')

  // Dogy magic:
  composed$.next = subject$.next.bind(subject$)

  return composed$;
}


export const getRequestFiles$ = (query="trashed = false") =>
{
  const nextPageToken$ = getNextPageToken$();

  const cancel$ = new Rx.Subject()
  const stop$ = Rx.Observable.merge(cancel$, storedFiles$);

  stop$.subscribe({
    next: x => log('stop$.next', x),
    complete: () => log('stop$.complete')
  })

  const reqFiles$ = Rx.Observable.from(nextPageToken$)
    .switchMap(pageToken => {
      return jwtRequest({
        url: 'https://www.googleapis.com/drive/v3/files',
        qs: {
          q: query,
          pageToken: pageToken,
          pageSize: 5,
        }
      })
    })
    .do(result => {
      if (result.nextPageToken) {
        // Request next page of changes
        nextPageToken$.next(result.nextPageToken)
      }
    })
    .do(result => {
      if (!result.nextPageToken) {
        // Signal to complete
        cancel$.next();
      }
    })
    .mergeMap(result => result.files)
    .takeUntil(stop$)
    .do(x => log('AAA', x)) // <-- On subscribe: This doesn't
    .buffer(stop$) // TODO! Something fishy happens here! `stop$` gets a buffered value from `storedfile$`...
    .do(x => log('BBB', x)) // <-- On subscribe: This does
    .do(files => {
      // Save files
      log('CCC', files)
      storage.setItemSync('files', files);
    })


    return reqFiles$;
}

export const getFiles$ = (query) =>
{
  if (storage.getItemSync('query') !== query) {
    // New query, invalidate files, update query
    storage.removeItemSync('files');
    storage.setItemSync('query', query);
  }

  const files$ = Rx.Observable.merge(storedFiles$, getReqFiles$(query))
    // Check for `changes$` -> update stored files (remove, add, update content)
    // Return a promise for all files

}


