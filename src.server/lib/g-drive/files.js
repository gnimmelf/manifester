import _debug from 'debug';
import Rx from 'rxjs/Rx';
import { normalize } from 'path';
import storage from '../storage';
import * as utils from '../utils';
import { jwtRequest } from './jwt';
import {
  primeStartPageToken as changesPrimeStartPageToken,
  getChanges$
} from './changes';

const debug = _debug('lib:g-drive:files');

export const getQueryFiles$ = (query="trashed = false") =>
{
  if (storage.getItemSync('query') !== query) {
    // New query, invalidate files, update query
    storage.removeItemSync('files');
    storage.setItemSync('query', query);
  }


  const storedFiles$ = Rx.Observable
    .from(storage.getItem('files'))
    .filter(files => files && files.length)
    .mergeMap(getChanges$()) // <-- Not the right operator...!
    // TODO! Update files with changes


  const nextPageToken$ = new Rx.Subject()
    .startWith('')
    .do(x => debug('nextPageToken$', x))


  const stop$ = new Rx.Subject().merge(storedFiles$)


  const reqFiles$ = nextPageToken$
    .takeUntil(stop$) // Cancel if data on storedFiles first or when `stop$.next()`
    .do(changesPrimeStartPageToken()) // Prime next changes request
    .switchMap(pageToken => {
      return jwtRequest({
        url: 'https://www.googleapis.com/drive/v3/files',
        qs: {
          q: query,
          pageSize: 5,
          pageToken: pageToken
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
      if (result.nextPageToken) {
        // Signal to complete
        stop$.next();
      }
    })
    .mergeMap(result => result.files)
    .do(files => {
      debug('files', files)
      // Save files
      storage.setItemSync('files', files);
    })

  const files$ = Rx.Observable.merge(storedFiles$, reqFiles$)
    // Check for `changes$` -> update stored files (remove, add, update content)
    // Return a promise for all files

}


