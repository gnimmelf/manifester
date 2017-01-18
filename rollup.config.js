/**
 * rollup.config.js
 */
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import riot from 'rollup-plugin-riot';
import npm from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

import {join} from 'path';
import {readFileSync} from 'jsonfile';


const useSourceMap = false;
const settings = readFileSync('./package.json').settings;

export default {
  entry: 'src.client/riot/main.js',
  dest: join(settings.dir_dist, 'bundle.js'),
  format: 'iife',
  sourceMap: useSourceMap,
  plugins: [
    json(),
    riot({
    	ext: 'html',
    	type: 'none'
    }),
    npm({
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs(),
    babel({
      sourceMap: useSourceMap,
      include: 'riot',
      babelrc: false,
      presets: ["es2015-rollup"]
    }),       
  ],
  globals: {
    riot: 'riot',
    jquery: '$',
    rx: 'Rx',
  },
  external: [
     'riot',
     'jquery',
     'rx'
 ]
}
