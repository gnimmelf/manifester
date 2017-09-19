const { join } = require('path');
const { upquire } = require('./utils');

const pathMaps = upquire('package.json').appSettings.pathMaps;
const bowerComponents = upquire('/bower.json').components;

// Collect `scripts` and `styles` from `bower.json` => `components`
module.exports = Object.entries(bowerComponents)
  .reduce((resources, component) => {
    const name = component[0];
    const data = component[1];

    ;['scripts', 'styles'].forEach(prop => {
      if (data[prop]) {
        const urls = (Array.isArray(data[prop]) ? data[prop] : [ data[prop] ])
          .map(resource => join(pathMaps.vendors.url, name, resource));

        resources[prop] = resources[prop].concat(urls);
      }
    })
    return resources;
  }, {
    scripts: [],
    styles: [],
  });
