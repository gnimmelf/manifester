const { join } = require('path');

const getBowerComponentsResources = (bower_components, { url_prefix='/bower_components' }={}) =>
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


module.exports = getBowerComponentsResources;