import { Observable } from 'rxjs/Observable';

export const isObservable = obs => obs instanceof Observable;

export const ensureObservable = (action) =>
  isObservable(action)
    ? action
    : Observable.from([action]);

export const log = console.log.bind(console);

export const httpGet = function(url) {
  // https://www.tomas-dvorak.cz/posts/nodejs-request-without-dependencies/
  // return new pending promise
  return new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const lib = url.startsWith('https') ? require('https') : require('http');
    const request = lib.get(url, (response) => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + response.statusCode));
       }
      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on('end', () => resolve(body.join('')));
    });
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
    })
};