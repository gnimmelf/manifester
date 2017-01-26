var gulp = require('gulp');
var runSequence = require('run-sequence');

// NOTE! Bower components are linked to directly 'as is' from within the html-templates
//var bowerFiles = require('main-bower-files');

// Helpers
var join = require('path').join;

var settings = require('./package.json').settings;

require('./gulp_tasks/server')(gulp);
require('./gulp_tasks/client')(gulp);

/**
 * Default task - call gulp and its done
 */

gulp.task('default', ['build']);

gulp.task('build', ['clean'], function() {
  runSequence(['client:build']);
  runSequence(['server:transpile']);
});

gulp.task('clean', ['client:clean', 'server:clean']);


gulp.task('client:build', ['client:clean'], function() {
  runSequence('client:postcss');
  runSequence('client:webpack');

});

gulp.task('client:watch', ['client:build'], function(done) {
  gulp.watch([join(settings.dir_src_client, '**', '*.css')] , ['client:postcss']);
  gulp.watch([
    join(settings.dir_src_client, '**', '*.js'),
    join(settings.dir_src_client, '**', '*tag.html'),
  ] , ['client:webpack']);
});

