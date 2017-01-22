var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var babel = require("gulp-babel");

// Helpers
var join = require('path').join;
var utils = require('./utils');
// Package settings
var settings = require('../package.json').settings;

module.exports = function(gulp) 
{
  gulp.task('server:transpile' , function(done) {
    return gulp.src(
      join(settings.src_server, '**', '*.js'))
      .pipe(sourcemaps.init())
      .pipe(babel())
      .on('error', utils.streamOnError)
      .pipe(concat("server.js"))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(settings.dir_server_dist));
  });
}
