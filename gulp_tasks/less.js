var gulp = require('gulp');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');

// Helpers
var join = require('path').join;
// Package settings
var settings = require('../package.json').settings;

module.exports = function(gulp) 
{
  gulp.task('less:compile' , function(done) {
    return gulp.src(
      join(settings.src_client, '**', '*.less'))
      .pipe(sourcemaps.init())
      .pipe(less())
      .pipe(sourcemaps.write(settings.dir_public))
      .pipe(concat('styles.css'))
      .pipe(gulp.dest(settings.dir_dist)
    );
  });
}