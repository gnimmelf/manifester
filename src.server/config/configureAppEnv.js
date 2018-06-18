const assert = require('assert');
const {
  join,
  dirname,
  resolve,
  parse
} = require('path');

const NODE_ENV = process.env.NODE_ENV||'';
const ALLOWED_ENVS =['production', 'development', 'test']

module.exports = (app, { defaultEnv='development' }={}) =>
{

  assert(app, 'required!')

  const getEnv = (vsEnvStr='') => {

    if (!vsEnvStr) {
      vsEnvStr = NODE_ENV;
    }

    const checkLen = Math.min(NODE_ENV.length, vsEnvStr.length);

    if (vsEnvStr.substr(0, checkLen).toLowerCase() == NODE_ENV.substr(0, checkLen).toLowerCase()) {
      // Return the full Env-name
      return ALLOWED_ENVS.find(allowedEnv => vsEnvStr == allowedEnv.substr(0, vsEnvStr.length));;
    }
    return false;

  };

  const nodeEnv = getEnv(process.env.NODE_ENV || defaultEnv);

  assert(nodeEnv, `'NODE_ENV' must be one of ${ALLOWED_ENVS} when specified! -Defaults to 'development'`);

  /**
   * Set globals (YES, THEY ARE!)
   */

  if (nodeEnv == 'test') {
    // Must be set globally allready!
    assert(global.__localAppRoot, '"global.__localAppRoot" must be set when testing!');
  }
  else {
    global.__localAppRoot = parse(process.mainModule.filename).dir;
  }

  global.__getEnv = getEnv

  // Standard config return, a list of [k,v] tuples
  return [
    ['__localAppRoot', __localAppRoot],
    ['process.env.NODE_ENV', process.env.NODE_ENV],
    ['Allowed Envs', ALLOWED_ENVS.join(', ')],
    ['Env', nodeEnv],
  ]

}