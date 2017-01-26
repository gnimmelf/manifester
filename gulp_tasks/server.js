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

  gulp.task('server:clean' , function(done) {
    utils.rmdir(settings.dir_dist_server, done);
  });

  gulp.task('server:transpile' , function(done) {
    return gulp.src(
      join(settings.dir_src_server, '**', '*.js'))
      .pipe(sourcemaps.init())
      .pipe(babel({
        babelrc: false,
        presets: ["es2015"],
        //"plugins": ["external-helpers"],
      }))
      .on('error', utils.streamOnError)
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(settings.dir_dist_server));
  });
}
