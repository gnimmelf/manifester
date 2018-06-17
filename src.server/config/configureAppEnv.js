const assert = require('assert');
const {
  join,
  dirname,
  resolve,
  parse
} = require('path');

const NODE_ENV = process.env.NODE_ENV||'';

module.exports = (app, {
  allowedEnvs=['production', 'development', 'test'],
  defaultEnv='development',
}={}) => {

  assert(app, 'required!')

  const getEnv = (vsEnvStr='') => {

    if (!vsEnvStr) {
      vsEnvStr = NODE_ENV;
    }

    const checkLen = Math.min(NODE_ENV.length, vsEnvStr.length);

    if (vsEnvStr.substr(0, checkLen).toLowerCase() == NODE_ENV.substr(0, checkLen).toLowerCase()) {
      // Return the full Env-name
      return allowedEnvs.find(allowedEnv => vsEnvStr == allowedEnv.substr(0, vsEnvStr.length));;
    }
    return false;

  };

  const nodeEnv = getEnv(process.env.NODE_ENV || defaultEnv);

  assert(nodeEnv, `'NODE_ENV' must be one of ${allowedEnvs} when specified! -Defaults to 'development'`);

  console.log(`NODE_ENV ${NODE_ENV} (${getEnv()}, isProduction: ${!!getEnv('production')})`);

  // Set globals (YES, THEY ARE!)
  global.__localAppRoot = parse(process.mainModule.filename).dir;
  global.__getEnv = getEnv

}