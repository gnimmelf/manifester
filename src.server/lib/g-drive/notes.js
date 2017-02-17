import _debug from 'debug';
import Rx from 'rxjs/Rx';
import upquire from 'upquire';
import { makeJwtRequest } from './jwt';
import { log } from '../utils';

const debug = _debug('lib:google:drive:request');

const GSA = upquire('/sensitive/g_service_account.json');

const jwtRequest = makeJwtRequest(
{
  email: GSA.client_email,
  key: GSA.private_key,
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
})



// `value/getValue` is not present after applying instance methods
// https://github.com/ReactiveX/rxjs/issues/2378
let gPageToken = null; // Substitute `null` w/ a `pageToken:<int>` to get changes from that page and onwards

const nextPageToken$ = new Rx.Subject()
  .filter(x => x) // Check that data is truthy as a number
  .do(x => gPageToken = x)
  .do(x => debug('reqStartPageToken$', x))


const reqStartPageToken$ = Rx.Observable
  .from(jwtRequest('https://www.googleapis.com/drive/v3/changes/startPageToken'))
  .pluck('startPageToken')
  .do(x =>  gPageToken = x) // Update `gPageToken` to most recent `startPageToken`
  .takeUntil(nextPageToken$) // Cancel if data on nextPageToken first
  .do(x => debug('reqStartPageToken$', x))


const request$ = () =>
{
  if (gPageToken) nextPageToken$.next(gPageToken);

  const flushBuffer$ = new Rx.Subject();
  const changes$ = Rx.Observable.merge(nextPageToken$, reqStartPageToken$)
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
        // Prime next request
        gPageToken = result.newStartPageToken;
        // Signal buffer to flush
        flushBuffer$.next();
      }
    })
    .mergeMap(result => result.changes)
    .buffer(flushBuffer$)
    .do(changes => debug(gPageToken, changes))

  return changes$;
}

export const changes$ = reqChanges$;

//------------------------------------

const base_url = "https://www.googleapis.com/drive/v3/"

const makeUrl = (...args) =>
{
  // Last param is always url-query, pass '' as last param for no query
  return base_url + normalize(args.reduce((acc, curr, idx, arr) => {
    return acc+(idx < arr.length-1 ? '/': (curr ? '?' : ''))+curr;
  }, ''))
}

export const queryFiles = (query="trashed = false") =>
{
  // Check if files exist in storage
  // - Return from storage if found
  // Check if files are changed
  // - refetch changed files (by id)

  return new Promise((resolve, reject) => {

    jwtRequest(makeUrl('files', 'q='+query))
    .then((data) => {
      debug('files.length', data.files.length)

      Promise.all(
        data.files
        .map((file) =>
        {

          return new Promise((resolve, reject) =>
          {
            jwtRequest(makeUrl('files', file.id, 'alt=media'), {raw_body: true})
            .then((content) =>
            {
              file.content = content;
              resolve(file)
            })
          });
        })
      )
      .then((all_values) =>
      {
        // Add files to storage
        resolve(all_values)
      }, utils.error)

    }, utils.error)
  })
}