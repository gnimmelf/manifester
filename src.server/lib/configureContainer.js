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

  container.register({
    'mainApp': asValue(mainApp),
    'tokenKeyName': asValue('XSRF-TOKEN'),
  });

  container.loadModules([
    ['services/scoped/*.js', Lifetime.SCOPED],
    ['services/singleton/*.js', {
      injector: () => ({ mainApp: mainApp }),
      lifetime: Lifetime.SINGLETON,
    }],
  ]
  , {
    formatName: 'camelCase',
    cwd: cwd,
  });

  /**
   * Register `templateService & default templates
   */
  const templateService = container.resolve('templateService');

  ;[
    'mail-login-code.pug',
  ].forEach(templateService.set)


  return container;
}