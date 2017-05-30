var gutil = require("gulp-util");
var runSequence = require('run-sequence');

// Helpers
var utils = require('./utils');
// Package settings
var settings = require('upquire')('/package.json').settings;


module.exports = function(gulp)
{
  const rollup = require('./utils/rollup')(gulp);


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
      .pipe(concat('styles.css'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(settings.dir_dist_client))
  });


  gulp.task('client:rollup', (done) => {
    rollup('main', done);
  });

}
