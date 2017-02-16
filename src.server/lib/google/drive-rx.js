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


let gPageToken = null;

const reqStartPageToken$ = Rx.Observable
  .from(jwtRequest('https://www.googleapis.com/drive/v3/changes/startPageToken'))
  .pluck('startPageToken')
  .do((startPageToken) => { gPageToken = startPageToken })

const nextPageToken$ = new Rx.Subject()
  .do(x => gPageToken = x)


const changes$ = () => {
  const emit$ = new Rx.Subject();

  const m$ = Rx.Observable.merge(reqStartPageToken$, nextPageToken$)
    .do(x => log('pageToken:', x))
    .switchMap((pageToken) => {
      return jwtRequest({
        url: 'https://www.googleapis.com/drive/v3/changes',
        json: true,
        qs: {
          pageToken: pageToken
        }
      }, {raw_body: true})
    })
    .do(x => log('res:\n', x))
    .map((result) => {

      if (result.newStartPageToken) {
        // Signal buffer to emit
        emit$.next();
      }
      else {
        // Request next page of changes
        nextPageToken$.next(result.pageToken)
        return result.changes;
      }
    })
    .buffer(emit$)
    .do(log(gPageToken))

  // Kickoff until
  m$.subscribe({
      next: (x) => log(gPageToken, x),
    });

  return m$
}

changes$()
