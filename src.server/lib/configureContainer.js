/**
 * "composition root":
 * https://medium.com/@Jeffijoe/dependency-injection-in-node-js-2016-edition-part-3-c01471c09c6d
 */
const assert = require('assert');
const {
  createContainer,
  Lifetime,
  ResolutionMode,
  asValue,
  asFunction,
  asClass
} = require('awilix');

module.exports = function(mainExpressApp, cwd) {

  assert(mainExpressApp, 'required!')
  assert(cwd, 'required!')

  const container = createContainer();

  container.registerValue('mainExpressApp', mainExpressApp)
  container.registerValue('tokenKeyName', 'x-access-token');

  container.loadModules([
    ['services/*.js', Lifetime.SINGLETON],
    ['services/scoped/*.js', Lifetime.SCOPED],
  ]
  , {
    formatName: 'camelCase',
    cwd: cwd,
  });

  /**
   * Register default templates
   */
  const templateService = container.resolve('templateService');
  [
    'mail-logincode.hbs',
  ].forEach(templateService.set)


  return container;
}