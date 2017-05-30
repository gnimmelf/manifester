const dotProp = require('dot-prop');
const upquire = require('upquire');


exports.upquirePath = (some_path) =>
{
  return upquire(some_path, { pathOnly: true, dirnameOnly: true })
}


exports.httpGet = (url) =>
{
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


let interpolation_re = exports.interpolation_re = /{([^}]+)}/g;
exports.interpolate = (string, data, missing='MISSING INTERPOLATE DATA') =>
{

  const matches = string.match(interpolation_re)

  matches.map((match => {
    let dot_path = match.replace(/\s|\{|\}/g, '');
    let value = dotProp.get(data, dot_path);
    string = string.replace(match, value, missing)
  }));

  return string
}