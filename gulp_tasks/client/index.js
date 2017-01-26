var gulp = require('gulp');
var gutil = require("gulp-util");

// Helpers
var utils = require('../utils');
// Package settings
var settings = require('upquire')('/package.json').settings;

require('./webpack')(gulp);
require('./rollup')(gulp);

module.exports = function(gulp)
{

  gulp.task('client:clean' , (done) =>
  {
    utils.rmdir(settings.dir_dist_client, done);
  });

  gulp.task('client:postcss' , (done) =>
  {
    var postcss       = require('gulp-postcss');
    var autoprefixer  = require('autoprefixer');
    var postcssNext   = require('postcss-cssnext');
    var concat        = require('gulp-concat');
    var sourcemaps    = require('gulp-sourcemaps');

    return gulp.src(utils.join(settings.dir_src_client, '**', '*.css'))
      .pipe(sourcemaps.init())
      .pipe(postcss([
        postcssNext(),
      ]))
      .on('error', utils.streamOnError)
      //.pipe(gulp.dest(settings.dir_dist_client))
      //.pipe(sourcemaps.write('.'))
      .pipe(concat('styles.css'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(settings.dir_dist_client))
  });

}
