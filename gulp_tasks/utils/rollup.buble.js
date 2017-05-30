const rollup = require('rollup')
const riot = require('rollup-plugin-riot')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const buble = require('rollup-plugin-buble')

// Helpers
const utils = require('../utils');

// Package settings
var settings = require('upquire')('/package.json').settings;

module.exports = (gulp) => {

  return (js_main_name, done) =>
  {
    return rollup.rollup({
      entry: utils.join(settings.dir_src_client, `${js_main_name}.js`),
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
      external: [
        'riot',
        'jquery',
        'rx'
      ],
    })
    .then(function (bundle) {
      bundle.write({
        globals: {
          riot: 'riot',
          jquery: '$',
          rx: 'Rx',
        },
        format: "iife",
        dest: `${settings.dir_dist_client}/${js_main_name}.bundle.js`,
        // Note: The riot-compiler does not currently generate sourcemaps
        // so rollup will throw a warning about the sourcemap likely being incorrect
        sourceMap: true
      });
    })
    .then(done)
  }
}