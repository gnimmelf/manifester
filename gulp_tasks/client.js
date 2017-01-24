var gulp = require('gulp');
var rename = require('gulp-rename');
var rollup = require('gulp-better-rollup');

// https://github.com/rollup/rollup-plugin-babel
var babel = require('rollup-plugin-babel');

var json = require('rollup-plugin-json');
var riot = require('rollup-plugin-riot');
var npm = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');
var sourcemaps = require('gulp-sourcemaps');
var rollup_sourcemaps = require('rollup-plugin-sourcemaps');
var concat = require('gulp-concat');
var less = require('gulp-less');

// Helpers
var join = require('path').join;
var utils = require('./utils');
// Package settings
var settings = require('../package.json').settings;

module.exports = function(gulp) 
{

  gulp.task('client:clean' , function(done) {
    utils.rmdir(settings.dir_dist_client, done);    
  });

  gulp.task('client:less:compile' , function(done) {
    return gulp.src(
      join(settings.dir_src_client, '**', '*.less'))
      .pipe(sourcemaps.init())      
      .pipe(less())
      .on('error', utils.streamOnError)      
      .pipe(sourcemaps.write())
      .pipe(concat('styles.css'))
      .pipe(gulp.dest(settings.dir_dist_client));
  });

  gulp.task('client:rollup:compile', (done) => {
    return gulp.src('src.client/riot/main.js')   
      .pipe(sourcemaps.init({ identityMap: true }))
      .pipe(rollup({ 
        /** Rollup options 
         * https://github.com/rollup/rollup/wiki/JavaScript-API#rolluprollup-options-
         */                  
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
            babelrc: false,
            presets: ["es2015-rollup"]
          }),
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
      .pipe(sourcemaps.write({
      }
      }))
      .pipe(gulp.dest(settings.dir_dist_client));      
  });
}