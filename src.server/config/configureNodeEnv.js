const assert = require('assert');

const NODE_ENV = process.env.NODE_ENV

module.exports = function(allowedEnvs=['production', 'development', 'test'], defaultEnv='development') {

  const checkEnv = (vsEnvStr=undefined) => {

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

  const nodeEnv = checkEnv(process.env.NODE_ENV || defaultEnv);

  assert(nodeEnv, `'NODE_ENV' must be one of ${allowedEnvs} when specified! -Defaults to 'development'`);

  console.log('NODE_ENV', NODE_ENV, checkEnv(), 'isProduction:', !!checkEnv('production'));

  // Make checker available for use elsewhere
  return checkEnv;
}