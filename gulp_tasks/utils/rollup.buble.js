const debug = require('debug')('client:rollup:buble');

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

  return (js_main_name, done) =>
  {
    return rollup.rollup({
      entry: utils.join(pathMaps.srcClient.dir, `${js_main_name}.js`),
      plugins: [
        riot({
          presets: ['es2015-riot'],
          ext: 'html',
          type: 'none',
          sourceMap: true,
        }),
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
        dest: `${pathMaps.distClient.dir}/${js_main_name}.bundle.js`,
        // Note: The riot-compiler does not currently generate sourcemaps
        // so rollup will throw a warning about the sourcemap likely being incorrect
        sourceMap: false
      });
    })
    .then(done)
  }
}