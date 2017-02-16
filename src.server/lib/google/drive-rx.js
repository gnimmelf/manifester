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


let startPageToken = null;
const reqStartPageToken$ = () => {
  let observable;
  if (!startPageToken) {
    observable = Rx.Observable
      .from(jwtRequest('https://www.googleapis.com/drive/v3/changes/startPageToken'))
      .pluck('startPageToken')
      .do((token) => { startPageToken = token })
  }
  else {
    observable = Rx.Observable.of(startPageToken)
  }
  observable.do(log)
  return observable
}

const changes$ = new Rx.Subject()
  .do(log)
  .switchMap((pageToken) => {
    return jwtRequest({
      url: 'https://www.googleapis.com/drive/v3/changes',
      json: true,
      qs: {
        pageToken: pageToken
      }
    }, {raw_body: true})
  })
  .map((result) => {
    if (result.startPageToken && result.startPageToken > startPageToken) {
      startPageToken = result.startPageToken
      changes.complete()
    }
    else {

    }
  })

changes$
  .subscribe(log)
  .onComplete('Complete', log)