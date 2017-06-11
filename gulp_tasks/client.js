const join = require('path').join;
const upquire = require('upquire');
const mkdirp = require('mkdirp').sync;
const copy = require('cpx').copySync;

const gutil = require("gulp-util");
const runSequence = require('run-sequence');

// Helpers
const utils = require('./utils');
const pathMaps = upquire('/package.json').appSettings.pathMaps;

module.exports = function(gulp)
{
  const rollup = require('./utils/rollup.buble.js')(gulp);


  gulp.task('client:clean' , (done) =>
  {
    utils.rmdir(pathMaps.distClient.dir, done);
  });


  gulp.task('client:postcss' , (done) =>
  {
    const postcss       = require('gulp-postcss');
    const autoprefixer  = require('autoprefixer');
    const postcssNext   = require('postcss-cssnext');
    const concat        = require('gulp-concat');
    const sourcemaps    = require('gulp-sourcemaps');

    return gulp.src(utils.join(pathMaps.srcClient.dir, '**', '*.css'))
      .pipe(sourcemaps.init())
      .pipe(postcss([
        postcssNext(),
      ]))
      .on('error', utils.streamOnError)
      .pipe(concat('bundle.css'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(pathMaps.distClient.dir))
  });


  gulp.task('client:rollup', (done) => {
    rollup('main', done);
  });

}
