var gutil = require("gulp-util");
var runSequence = require('run-sequence');

// Helpers
var utils = require('../utils');
// Package settings
var settings = require('upquire')('/package.json').settings;

const compile_stream = (gulp, js_main_name) =>
{
  var riot          = require('gulp-riot');
  var sourcemaps    = require('gulp-sourcemaps');

  return gulp.src(utils.join(settings.dir_src_client, '**', '*tag.html'))
    .pipe(sourcemaps.init())
    .pipe(riot({
        entry: utils.join(settings.dir_src_client, `${js_main_name}.js`),
        presets: ['es2015-riot'],
        ext: 'html',
        type: 'none',
        sourceMap: true,
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(settings.dir_dist_client))
}

const bundle_stream = (gulp, js_main_name) =>
{
  var rollup        = require('gulp-better-rollup');
  var riot          = require('rollup-plugin-riot');
  var babel         = require('rollup-plugin-babel');
  var json          = require('rollup-plugin-json');
  var nodeResolve   = require('rollup-plugin-node-resolve');
  var commonjs      = require('rollup-plugin-commonjs');
  var rename        = require('gulp-rename');
  var sourcemaps    = require('gulp-sourcemaps');

  return gulp.src(utils.join(settings.dir_src_client, `${js_main_name}.js`))
    .pipe(sourcemaps.init())
    .pipe(rollup({
      // Rollup options
      // https://github.com/rollup/rollup/wiki/JavaScript-API#rolluprollup-options-
      plugins: [
        json(),
        riot({
          ext: 'html',
          type: 'none'
        }),
        nodeResolve({
          jsnext: true,
          main: true,
          browser: true
        }),
        commonjs(),
        babel({
          "presets": [
            ["es2015", {"modules": false}]
          ],
          "plugins": ["external-helpers"]
        })
      ],
      external: [
        'riot',
        'jquery',
        'rx'
      ],
      globals: {
        riot: 'riot',
        jquery: '$',
        rx: 'Rx',
      },
      onwarn: utils.makeOnwarn("Sourcemap is likely to be incorrect:")
    }, {
      // Bundle generate options
      // https://github.com/rollup/rollup/wiki/JavaScript-API#bundlegenerate-options-
      format: 'iife',
    }))
    .on('error', utils.streamOnError)
    .pipe(sourcemaps.write())
    .pipe(rename(`${js_main_name}.bundle.js`))
    .pipe(gulp.dest(settings.dir_dist_client));


}




module.exports = (gulp) => {

  return (js_main_name, done) =>
  {
    new Promise((resolve, reject) => {
      compile_stream(gulp, js_main_name).on('end', resolve)
    })
    .then(() =>{
      bundle_stream(gulp, js_main_name).on('end', done)
    })
    .catch((err) => {
      console.error(err);
    })

  }

};