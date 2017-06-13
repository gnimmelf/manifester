const debug = require('debug')('client:rollup:buble');

const path = require('path');
const rollup = require('rollup')
const riot = require('rollup-plugin-riot')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const buble = require('rollup-plugin-buble');
const upquire = require('upquire');

// Helpers
const utils = require('../utils');
const pathMaps = upquire('/package.json').appSettings.pathMaps;

// Bower components (custom property)
const components = upquire('/bower.json').components;

const globals = utils.getBowerComponentsGlobals(components);

debug('rollup globals', globals)

module.exports = (gulp) => {

  return (js_main, done) =>
  {

    console.log(utils.join(pathMaps.distClient.dir, '../', utils.replaceExt(js_main, '.bundle.js')))

    return rollup.rollup({
      entry: utils.join(pathMaps.distClient.dir, js_main),
      plugins: [
        nodeResolve({
          jsnext: true,
          main: true,
          browser: true
        }),
        commonjs(),
        buble()
      ],
      external: Object.keys(globals),
    })
    .then(function (bundle) {
      bundle.write({
        globals: globals,
        format: "iife",
        dest: utils.join(pathMaps.distClient.dir, utils.replaceExt(path.basename(js_main), '.bundle.js')),
        // Note: The riot-compiler does not currently generate sourcemaps
        // so rollup will throw a warning about the sourcemap likely being incorrect
        sourceMap: true
      });
    })
    .then(done)
  }
}