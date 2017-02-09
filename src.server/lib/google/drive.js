import _debug from 'debug';
import upquire from 'upquire';
import storage from 'node-persist';
import { normalize } from 'path';
import { makeJwtRequest } from './jwt';
import * as utils from '../utils';

const debug = _debug('lib:google:drive');

const GSA = upquire('/sensitive/g_service_account.json');

const jwtRequest = makeJwtRequest({
  email: GSA.client_email,
  key: GSA.private_key,
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
})

const base_url = "https://www.googleapis.com/drive/v3/files"

const makeUrl = (...args) => {
  // Last param is always url-query, pass '' as last param for no query
  return base_url + normalize(args.reduce((acc, curr, idx, arr) => {
    return acc+(idx < arr.length-1 ? '/': (curr ? '?' : ''))+curr;
  }, ''))


}

export const queryFiles = (query="trashed = false") => {
  // Check if files exist in storage
  // Return from storage if found
  // How to refresh storage from client?

  return new Promise((resolve, reject) => {

    jwtRequest(makeUrl('q='+query))
    .then((data) => {
      debug('files.length', data.files.length)
      Promise.all(
        data.files
        .map((file) => {
          return new Promise((resolve, reject) => {
            jwtRequest(makeUrl(file.id, 'alt=media'), true)
            .then((content) => {
              file.content = content;
              resolve(file)
            })
          });
        })
      )
      .then((all_values) => {
        // Add files to storage
        resolve(all_values)
      }, utils.error)

    }, utils.error)
  })
}
