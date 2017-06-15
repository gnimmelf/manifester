const upquire = require('upquire');
const dirname = require('path').dirname;
const mkdirp = require('mkdirp').sync;
const copy = require('cpx').copySync;
const riot = require('gulp-riot');
const wrapper = require('gulp-wrapper');

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

  gulp.task('client:riot' , (done) =>
  {
    return gulp.src(utils.join(pathMaps.srcClient.dir, 'riot', '**', '*.html'))
      .pipe(riot({
        compact: true,

      }))
      .pipe(wrapper({ header: '/* File: "riot/${filename}" */\n\n' }))
      .pipe(gulp.dest(utils.join(pathMaps.distClient.dir, 'riot')));
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
    const js_main = 'riot/main.js';

    mkdirp(pathMaps.distClient.dir);
    copy(utils.join(pathMaps.srcClient.dir, js_main), dirname(utils.join(pathMaps.distClient.dir, js_main)));

    rollup(js_main, done);
  });

}
