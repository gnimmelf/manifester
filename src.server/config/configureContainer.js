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
const { scopePerRequest } = require('awilix-express');

module.exports = (app, {
  servicesDir,
  tokenKeyName='XSRF-TOKEN',
}) => {

  assert(app, 'required!')
  assert(servicesDir, 'required!')

  const container = createContainer();

  container.register({
    'app': asValue(app),
    'tokenKeyName': asValue(tokenKeyName),
  });

  container.loadModules([
    ['scoped/*.js', Lifetime.SCOPED],
    ['singleton/*.js', {
      injector: () => ({ app: app }),
      lifetime: Lifetime.SINGLETON,
    }],
  ]
  , {
    formatName: 'camelCase',
    cwd: servicesDir,
  });

  /**
   * Register `templateService & default templates
   */
  const templateService = container.resolve('templateService');

  ;[
    'mail-login-code.pug',
  ].forEach(templateService.set);

  app.set('container', container);
  app.use(scopePerRequest(container));

  // Standard config return, a list of [k,v] tuples
  return [
    ['servicesDir', servicesDir],
    ['templateService.templates', Object.keys(templateService).join(',')],
    ['tokenKeyName', tokenKeyName]
  ]
}