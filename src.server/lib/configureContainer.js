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

module.exports = function(mainApp, cwd) {

  assert(mainApp, 'required!')
  assert(cwd, 'required!')

  const container = createContainer();

  container.registerValue('mainApp', mainApp)
  container.registerValue('tokenKeyName', 'XSRF-TOKEN');

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
    'mail-login-code.pug',
    'single-page-app.pug',
  ].forEach(templateService.set)


  return container;
}