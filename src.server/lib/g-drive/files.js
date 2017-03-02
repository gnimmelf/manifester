import _debug from 'debug';
import Rx from 'rxjs/Rx';
import { normalize } from 'path';
import storage from '../storage';
import { jwtRequest } from './jwt';
import {
  log,
  composedSubjectBindNext
} from '../utils';
import * as changes from './changes';


const debug = _debug('lib:g-drive:files');


const storage_key = 'files';
export const setStorageFiles = (x) => storage.setItemSync(storage_key, x);
export const getStorageFiles = () => storage.getItemSync(storage_key);
export const removeStorageFiles = () => storage.removeItemSync(storage_key);
export const hasStorageFiles = () => {
  const files = getStorageFiles();
  return files ?
    (files.length ? true : false) :
    false;
}


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

    return reqFiles$;
}


export const getStoredUpdatedFiles$ = () =>
{
  // Files exist in storage, request changes then update stored files (remove, add, update content)
  const stored_files = getStorageFiles();

  // TODO! Need more logic to figure out when to request changes, and when to apply them.

  const files = stored_files.reduce(function(acc, cur) {
    acc[cur.id] = cur;
    return acc;
  }, {});

  const stop$ = new Rx.Subject();

  const files$ = new Rx.Subject()
    .takeUntil(stop$)
    .buffer(stop$)

  changes.getRequestChanges$()
    .do(() => log('Changes requested!'))
    .subscribe(changes => {
      for (var change of changes) {
        log('change', change)
        // Change is new file?
        // Change is removed file?
        // Change is updated file (content, title, [...])?

        //files_buffer$.next(fresh_file)
      }
    })

  return files$
}


export const getFiles$ = (query) =>
{
  const deferred$ = Rx.Observable.defer(() => {

    if (storage.getItemSync('query') !== query)
    {
      // New query, invalidate files, update query
      storage.removeStorageFiles();
      storage.setItemSync('query', query);
    }

    if (hasStorageFiles())
    {
      debug('getFiles$', 'from storage and updated')
      const files$ = getStoredUpdatedFiles$();
      return files$;
    }
    else
    {
      debug('getFiles$', 'requesting and priming for getting next changes')

      const stop$ = new Rx.Subject();

      const files$ = getRequestFiles$(query)
        .do(() => {
          // Prime new startPageToken for next set of changes:
          changes.primeStartPageToken()
            .catch(log)
            .then((pageToken) => {
              // Wait for priming to finnish...
              debug('getFiles$', 'changesPrimeStartPageToken', pageToken);
              stop$.next()
            })
        })
        .takeUntil(stop$)
        .buffer(stop$)

      return files$;
    }

  });

  // Save files to storage, they're either requested or updated
  deferred$
    .do(files => {
      log('Storing files')
      // Save files
      storage.setItemSync('files', files);
    })

  return deferred$;
}


