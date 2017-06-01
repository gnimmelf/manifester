const join = require('path').join;
const upquire = require('upquire');
const mkdirp = require('mkdirp').sync;
const copy = require('cpx').copySync;

const gutil = require("gulp-util");
const runSequence = require('run-sequence');

// Helpers
const utils = require('./utils');

// Package settings
const settings = require('upquire')('/package.json').settings;


const preBundle = () =>
{

  const dir_src_client = upquire(settings.dir_src_client, { pathOnly: true });
  const dir_dist_client = upquire(settings.dir_dist_client, { pathOnly: true });

  try {
    mkdirp(dir_dist_client);
    copy(join(dir_src_client, '../', 'pre.bundle.js'), dir_dist_client);
  } catch(err) {
    throw err;
  }
}

module.exports = function(gulp)
{
  const rollup = require('./utils/rollup.buble.js')(gulp);


  gulp.task('client:clean' , (done) =>
  {
    utils.rmdir(settings.dir_dist_client, done);
  });


  gulp.task('client:postcss' , (done) =>
  {
    const postcss       = require('gulp-postcss');
    const autoprefixer  = require('autoprefixer');
    const postcssNext   = require('postcss-cssnext');
    const concat        = require('gulp-concat');
    const sourcemaps    = require('gulp-sourcemaps');

    return gulp.src(utils.join(settings.dir_src_client, '**', '*.css'))
      .pipe(sourcemaps.init())
      .pipe(postcss([
        postcssNext(),
      ]))
      .on('error', utils.streamOnError)
      .pipe(concat('bundle.css'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(settings.dir_dist_client))
  });


  gulp.task('client:rollup', (done) => {
    preBundle();
    rollup('main', done);
  });

}
