var gulp = require('gulp');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');

// Helpers
var join = require('path').join;
var utils = require('./utils');
// Package settings
var settings = require('../package.json').settings;

module.exports = function(gulp) 
{
  gulp.task('client:less:compile' , function(done) {
    return gulp.src(
      join(settings.src_client, '**', '*.less'))
      .pipe(sourcemaps.init())
      .pipe(less())
      .on('error', utils.streamOnError)
      .pipe(sourcemaps.write(settings.dir_public))
      .pipe(concat('styles.css'))
      .pipe(gulp.dest(settings.dir_client_dist));
  });
}