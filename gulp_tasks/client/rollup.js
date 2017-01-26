var gulp = require('gulp');
var gutil = require("gulp-util");

// Helpers
var utils = require('../utils');
// Package settings
var settings = require('upquire')('/package.json').settings;

module.exports = function(gulp)
{

  gulp.task('client:riot:compile', (done) =>
  {
    var riot          = require('gulp-riot');
    var sourcemaps    = require('gulp-sourcemaps');

    return gulp.src(utils.join(settings.dir_src_client, '**', '*tag.html'))
      .pipe(sourcemaps.init())
      .pipe(riot({
          entry: utils.join(settings.dir_src_client, 'main.js'),
          presets: ['es2015-riot'],
          ext: 'html',
            type: 'none'
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(settings.dir_dist_client))
  });


  gulp.task('client:rollup', ['client:riot:compile'], (done) => {
    var rollup        = require('gulp-better-rollup');
    var riot          = require('rollup-plugin-riot');
    var babel         = require('rollup-plugin-babel');
    var json          = require('rollup-plugin-json');
    var nodeResolve   = require('rollup-plugin-node-resolve');
    var commonjs      = require('rollup-plugin-commonjs');
    var rename        = require('gulp-rename');
    var sourcemaps    = require('gulp-sourcemaps');

    return gulp.src(utils.join(settings.dir_src_client, 'main.js'))
      .pipe(sourcemaps.init())
      .pipe(rollup({
        // Rollup options
        // https://github.com/rollup/rollup/wiki/JavaScript-API#rolluprollup-options-
        plugins: [
          json(),
          nodeResolve({
            jsnext: true,
            main: true,
            browser: true
          }),
          commonjs(),
          babel({
            babelrc: false,
            presets: ["es2015"],
            //"plugins": ["external-helpers"],
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
      .pipe(rename('bundle.js'))
      .pipe(gulp.dest(settings.dir_dist_client));
  });
}