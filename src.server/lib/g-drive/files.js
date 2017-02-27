import _debug from 'debug';
import Rx from 'rxjs/Rx';
import { normalize } from 'path';
import storage from '../storage';
import { jwtRequest } from './jwt';
import {
  log,
  composedSubjectBindNext
} from '../utils';
import {
  primeStartPageToken as changesPrimeStartPageToken,
  getChanges$
} from './changes';

const debug = _debug('lib:g-drive:files');

const storage_key = 'files';
export const setStorageFiles = (x) => storage.setItemSync(storage_key, (x && x.length ? x : undefined));
export const getStorageFiles = () => storage.getItemSync(storage_key);
export const removeStorageFiles = () => storage.removeItemSync(storage_key);

export const storageFiles$ = new Rx.BehaviorSubject()
  .map(getStorageFiles)
  .filter(x => x && x.length)

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
  const stop$ = Rx.Observable.merge(cancel$, storageFiles$);

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
    .buffer(stop$)
    .do(files => {
      // Save files
      storage.setItemSync('files', files);
      // Prime changes StartPageToken
      changesPrimeStartPageToken();
    });

    return reqFiles$;
}

export const getFiles$ = (query) =>
{

  const files$ = Rx.Observable.defer(function () {
    if (storage.getItemSync('query') !== query) {
      // New query, invalidate files, update query, request fresh files
      storage.removeItemSync('files');
      storage.setItemSync('query', query);

      return getRequestFiles$(query);
    }
    else {
      // Files exist in storage, request changes then update stored files (remove, add, update content)
      const files = getStorageFiles().reduce(function(acc, cur, i) {
        acc[i] = cur;
        return acc;
      }, {});

      const stop$ = new Rx.Subject();

      const files$ = new Rx.Subject()
        .takeUntil(stop$)
        .buffer(stop$)

      changes$
        .subscribe(changes => {
          for (var change of changes) {
            log('change', change)
          }
        })

      return files$;
    }
  });

}


