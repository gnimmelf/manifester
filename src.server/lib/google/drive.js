import upquire from 'upquire';
import { makeJwtRequest } from './jwt';

const GSA = upquire('/sensitive/g_service_account.json');

const jwtRequest = makeJwtRequest({
  email: GSA.client_email,
  key: GSA.private_key,
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
})

const base_url = "https://www.googleapis.com/drive/v2/files?q:"

export const promiseFiles = (query="'0B4gB3nV9reGKWURSdDdWeGdBU1k' in parents") => {
  return new Promise((resolve, reject) => {

    jwtRequest(base_url + query)
    .then((data) => {
      Promise.all(
        data.items
        .filter((file, idx) => {
          return idx < 1;
        })
        .map((file) => {
          return new Promise((resolve, reject) => {
            jwtRequest(file.downloadUrl, true)
            .then((content) => {
              file.content = content;
              resolve(file)
            })
          });
        })
      )
      .then((all_values) => {
        resolve(all_values)
      })

    })
  })
}
