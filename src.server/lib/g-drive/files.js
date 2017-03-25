import _debug from 'debug';
import Rx from 'rxjs/Rx';
import { normalize } from 'path';

import storage from '../storage';
import { jwtRequest } from './jwt';

import * as utils from '../utils';


const debug = _debug('lib:g-drive:files');


const storage_key = 'files';
export const setStorageFiles = (files) => storage.setItemSync(storage_key, files);
export const getStorageFiles = () => storage.getItemSync(storage_key) || [];
export const removeStorageFiles = () => storage.removeItemSync(storage_key);
export const hasStorageFiles = () => {
  const files = getStorageFiles();
  return files ?
    (files.length ? true : false) :
    false;
}
export const getStorageQuery = () => storage.getItemSync('query');

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
  const debug = _debug('lib:g-drive:files:getRequestFiles');

  debug('Starting...')
  debug('Query', query || undefined)

  removeStorageFiles();

  const nextPageToken$ = getNextPageToken$();

  const stop$ = new Rx.Subject();

  const file$ = Rx.Observable.from(nextPageToken$)
    .takeUntil(stop$)
    .switchMap(pageToken => {
      return jwtRequest({
        url: 'https://www.googleapis.com/drive/v3/files',
        qs: {
          spaces: 'drive',
          pageToken: pageToken,
          pageSize: storage.getItemSync('pageSize') || 2,
          q: query,
        }
      })
    })
    .do(result => {
      debug('request results', result.files.length)
      if (result.nextPageToken) {
        // Request next page of files
        debug('Request next page of files', result.nextPageToken)
        nextPageToken$.next(result.nextPageToken)
      }
    })
    .do(result => {
      if (!result.nextPageToken) {
        // Signal to complete
        debug('Complete, no `nextPageToken`')
        stop$.next();
      }
    })
    .pluck('files')
    .concatMap(files => files)
    .map(file => {
      return jwtRequest({
        url: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
      })
      .then(content => {
        file.content = content;
        return file;
      })
    })
    .concatMap(promise => /* resolve */ promise)

  return file$
}


export default getRequestFiles$