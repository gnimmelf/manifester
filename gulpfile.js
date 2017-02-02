var gulp = require('gulp');
var runSequence = require('run-sequence');

// NOTE! Bower components are linked to directly 'as is' from within the html-templates
//var bowerFiles = require('main-bower-files');

// Helpers
var join = require('path').join;

var settings = require('./package.json').settings;

var client_bundler_task_name = "client:webpack";

require('./gulp_tasks/server')(gulp);
require('./gulp_tasks/client')(gulp);

/**
 * Default task - call gulp and its done
 */

gulp.task('default', ['build']);

gulp.task('build', ['clean'], function() {
  runSequence(['client:build']);
  runSequence(['server:build']);
});

gulp.task('clean', ['client:clean', 'server:clean']);


gulp.task('client:build', ['client:clean'], function() {
  runSequence('client:postcss');
  runSequence(client_bundler_task_name);

});

gulp.task('client:watch', ['client:build'], function(done) {
  gulp.watch([join(settings.dir_src_client, '**', '*.css')] , ['client:postcss']);
  gulp.watch([
    join(settings.dir_src_client, '**', '*.js'),
    join(settings.dir_src_client, '**', '*tag.html'),
  ] , [client_bundler_task_name]);
});

gulp.task('server:build', ['server:clean'], function(done) {
  runSequence('server:transpile:exec');
});

gulp.task('server:watch', ['server:build'], function(done) {
  runSequence('server:transpile:exec:watch');
});
