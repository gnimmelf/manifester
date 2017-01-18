/**
 * gulpfile.js
 * for integration with rollup / riot
 */
var gulp = require('gulp');
var shell = require('gulp-shell');
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

/**
 * default task - call gulp and its done
 */
gulp.task('default' , ['setup' , 'watch']);

gulp.task('setup' , function(done) {
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

gulp.task('rollup:c' , shell.task([
	'rollup -c'
]));

gulp.task('rollup' , function(done) {
	runSequence('rollup:clear' , 'rollup:c' , done);
});

gulp.task('watch' , function() {  
  gulp.watch([join(settings.src_client, '**', '*.less')] , ['less']);
  shell.task(['rollup -c -watch'])
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
