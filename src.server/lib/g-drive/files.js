import _debug from 'debug';
import Rx from 'rxjs/Rx';
import { normalize } from 'path';

import storage from '../storage';
import { jwtRequest } from './jwt';

import * as utils from '../utils';


const debug = _debug('lib:g-drive:files');


export const getNextPageToken$ = () => new Rx.BehaviorSubject('');


export const isFetching$ = new Rx.BehaviorSubject(false);


export const fetchFiles$ = (query="trashed = false") =>
{
  const debug = _debug('lib:g-drive:files:getFetchFiles');

  isFetching$.next(true);

  debug('Starting...')
  debug('Query', query || undefined)

  const nextPageToken$ = getNextPageToken$();

  const stop$ = new Rx.Subject() //utils.getStop$(debug);

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
    .concatMap(files => {
      // Emit individual files
      return files
    })
    .map(file => {
      // Download file content
      return jwtRequest({
        url: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
      })
      .then(content => {
        file.content = content;
        // Return a promise
        return file;
      })
    })
    .concatMap(promise => {
      // Resolves jwtRequest-promise into file-data
      return promise
    })

  return file$
}


export const promisedFiles = (query) =>
{
  return new Promise((resolve, reject) => {

    const fetched_files = [];

    fetchFiles$(query || undefined)
      .subscribe({
        next: file => {
          debug(file.name, Object.keys(file))
          fetched_files.push(file)
        },
        complete: () => {
          resolve(fetched_files)
        },
      })

  })
}


export default promisedFiles