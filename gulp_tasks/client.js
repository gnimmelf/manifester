var gulp = require('gulp');

// Helpers
var join = require('path').join;
var utils = require('./utils');
// Package settings
var settings = require('../package.json').settings;

module.exports = function(gulp)
{

  gulp.task('client:clean' , (done) => {
    utils.rmdir(settings.dir_dist_client, done);
  });

  gulp.task('client:postcss' , (done) => {
    var postcss       = require('gulp-postcss');
    var autoprefixer  = require('autoprefixer');
    var postcssNext   = require('postcss-cssnext');
    var concat        = require('gulp-concat');
    var sourcemaps    = require('gulp-sourcemaps');

    return gulp.src(join(settings.dir_src_client, '**', '*.css'))
      .pipe(sourcemaps.init())
      .pipe(postcss([
        postcssNext(),
      ]))
      .on('error', utils.streamOnError)
      .pipe(gulp.dest(settings.dir_dist_client))
      .pipe(sourcemaps.write('.'))
      .pipe(concat('styles.css'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(settings.dir_dist_client))
  });

  gulp.task('client:riot:compile', (done) => {
    var riot          = require('gulp-riot');
    var sourcemaps    = require('gulp-sourcemaps');

    return gulp.src(join(settings.dir_src_client, '**', '*tag.html'))
      .pipe(sourcemaps.init())
      .pipe(riot({
          presets: ['es2015-rollup']
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(settings.dir_dist_client))
  });


  gulp.task('client:rollup:bundle', ['client:riot:compile'], (done) => {
    var rollup        = require('gulp-better-rollup');
    var rename        = require('gulp-rename');
    var json          = require('rollup-plugin-json');
    var nodeResolve   = require('rollup-plugin-node-resolve');
    var commonjs      = require('rollup-plugin-commonjs');
    var sourcemaps    = require('rollup-plugin-sourcemaps');


    return gulp.src('src.client/riot/main.js')
      .pipe(sourcemaps.init())
      .pipe(rollup({
        /** Rollup options
         * https://github.com/rollup/rollup/wiki/JavaScript-API#rolluprollup-options-
         */
        plugins: [
          json(),
          riot({
            ext: 'html',
            type: 'none',
          }),
          nodeResolve({
            jsnext: true,
            main: true,
            browser: true
          }),
          commonjs(),
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
        //onwarn: utils.makeOnwarn("Sourcemap is likely to be incorrect:")
      }, {
        /** Bundle generate options
         * https://github.com/rollup/rollup/wiki/JavaScript-API#bundlegenerate-options-
         */
        format: 'iife',
      }))
      .on('error', utils.streamOnError)
      .pipe(rename('bundle.js'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(settings.dir_dist_client));
  });
}