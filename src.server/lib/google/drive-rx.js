import Rx from 'rxjs/Rx';
import upquire from 'upquire';

import { makeJwtRequest } from './jwt';

import { log } from '../utils';

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

const nextPageToken$ = new Rx.BehaviorSubject()
  .filter((x) => parseInt(x)) // Check that data is truthy as a number
  .do(x => gPageToken = x)

const reqStartPageToken$ = Rx.Observable
  .from(jwtRequest('https://www.googleapis.com/drive/v3/changes/startPageToken'))
  .pluck('startPageToken')
  .do((startPageToken) => { gPageToken = startPageToken }) // Update `gPageToken` to most recent `startPageToken`
  .takeUntil(nextPageToken$) // Cancel if data on nextPageToken first

const reqChanges$ = () => {
  if (gPageToken) {
    nextPageToken$.next(gPageToken)
  }

  const flushBuffer$ = new Rx.Subject();
  const changes$ = Rx.Observable.merge(nextPageToken$, reqStartPageToken$)
    .switchMap((pageToken) => {
      return jwtRequest({
        url: 'https://www.googleapis.com/drive/v3/changes',
        json: true,
        qs: {
          pageToken: pageToken,
          pageSize: 5,
        }
      }, {raw_body: true})
    })
    .do((result) => {
      if (result.nextPageToken) {
        // Request next page of changes
        nextPageToken$.next(result.nextPageToken)
      }
    })
    .do((result) => {
      if (result.newStartPageToken) {
        // Prime next request
        gPageToken = result.newStartPageToken;
        // Signal buffer to flush
        flushBuffer$.next();
      }
    })
    .mergeMap((result) => result.changes)
    .buffer(flushBuffer$)

  return changes$;
}

reqChanges$().subscribe({
  next: (x) => {
    log(`gPageToken: ${gPageToken}`)
    log(`Changes:\n`, x)
  }
});
