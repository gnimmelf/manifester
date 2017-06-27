const path = require('path');
const join = path.join;
const dotProp = require('dot-prop');
const upquire = require('upquire');

exports.makeLogincode = require('./generate-logincode');

exports.upquirePath = function(some_path, join_part)
{
  let full_path = upquire(some_path, { pathOnly: true, dirnameOnly: true });
  if (join_part) {
    full_path = join.apply(join, [full_path].concat( Array.prototype.slice.call(arguments, 1) ));
  }
  return full_path
}


exports.readJsonFile = (upquire_path) =>
{
  JSON.parse(fs.readFileSync(upquire(upquire_path, {pathOnly: true}), 'utf8'));
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


exports.getBowerComponentsResources = (bower_components, { url_prefix='/bower_components' }={}) =>
{
  // Collect `scripts` and `styles` from `bower.json` => `components`
  return Object.entries(bower_components)
    .reduce((resources, component) => {
      const name = component[0];
      const data = component[1];

      ;['scripts', 'styles'].forEach(prop => {
        if (data[prop]) {
          const urls = (Array.isArray(data[prop]) ? data[prop] : [ data[prop] ])
            .map(resource => join(url_prefix, name, resource));

          resources[prop] = resources[prop].concat(urls);
        }
      })
      return resources;
    }, {
      scripts: [],
      styles: [],
    });
}