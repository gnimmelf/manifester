/**
 * gulpfile.js
 * for integration with rollup / riot
 */
var gulp = require('gulp');
var inject = require('gulp-inject');
var concat = require('gulp-concat');
// less processor
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');

// bower required tools
var bowerFiles = require('main-bower-files');

// build in tool
var path = require('path');
var join = path.join;

var del = require('del');
var runSequence = require('run-sequence');

var settings = require('./package.json').settings;

// http://stackoverflow.com/a/13879531/1008905
var spawn = require('child_process').spawn;
function exec(command, done) {
   spawn('sh', ['-c', command], { stdio: 'inherit' });
   (done && done());
}

/**
 * default task - call gulp and its done
 */
gulp.task('default' , ['build' , 'watch']);

gulp.task('build' , function(done) {
	runSequence('rollup', 'less', done);
});

/**
 * start of tasks
 */
gulp.task('rollup:clear' , function() {
	return del([
        // using path.join to make sure it works cross platform
        join(settings.dir_dist , 'bundle.js')
    ]);
});

gulp.task('rollup:c' , function(done) {
  exec('rollup -c', done);  
});

gulp.task('rollup' , function(done) {
	runSequence('rollup:clear' , 'rollup:c' , done);
});

gulp.task('watch', ['less'], function(done) {  
  gulp.watch([join(settings.src_client, '**', '*.less')] , ['less']);
  exec('rollup -c --watch', done);
});

/**
 * less task
 */
gulp.task('less' , function() {
    return gulp.src(
            join(settings.src_client, '**', '*.less')
          ).pipe(sourcemaps.init())
          .pipe(less())
          .pipe(sourcemaps.write(settings.dir_public))
          .pipe(concat('styles.css'))
          .pipe(gulp.dest(settings.dir_dist));
});
