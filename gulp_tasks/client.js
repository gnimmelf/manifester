var gulp = require('gulp');
var rename = require('gulp-rename');
var rollup = require('gulp-better-rollup');
var babel = require('rollup-plugin-babel');
var json = require('rollup-plugin-json');
var riot = require('rollup-plugin-riot');
var npm = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');
var sourcemaps = require('gulp-sourcemaps');

// Helpers
var join = require('path').join;
var utils = require('./utils');
// Package settings
var settings = require('../package.json').settings;

module.exports = function(gulp) 
{

  gulp.task('client:clean' , function() {
    return del(settings.dir_dist_client);    
  });

  gulp.task('client:rollup:compile', (done) => {
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
        /** Bundle generate options
         * https://github.com/rollup/rollup/wiki/JavaScript-API#bundlegenerate-options- 
         */
        format: 'umd', 
      }))
      .on('error', utils.streamOnError)
      // inlining the sourcemap into the exported .js file 
      .pipe(sourcemaps.write(settings.dir_dist_client, {        
        //addComment: false,
        //includeContent: false,
        //sourceRoot: '/src',
      }))
      .pipe(rename('bundle.js'))
      .pipe(gulp.dest(settings.dir_dist_client));      
  });
}