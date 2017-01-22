var gulp = require('gulp');
// NOTE! Bower components are linked to directly 'as is' from within the html-templates
//var bowerFiles = require('main-bower-files');

// Helpers
var join = require('path').join;

var runSequence = require('run-sequence');

var settings = require('./package.json').settings;

require('./gulp_tasks/server')(gulp);
require('./gulp_tasks/client')(gulp);
require('./gulp_tasks/less')(gulp);

/**
 * Default task - call gulp and its done
 */

gulp.task('default' , ['build']);
gulp.task('build' , ['build:client', 'server:transpile']);

gulp.task('build:client' , function() {
	runSequence('client:less:compile', 'client:rollup:compile');
});

gulp.task('watch:client', ['build'], function(done) {  
  gulp.watch([join(settings.src_client, '**', '*.less')] , ['less:compile']);
  gulp.watch([
    join(settings.src_client, '**', '*.js'),
    join(settings.src_client, '**', '*tag.html'),
  ] , ['client:rollup:compile']);
});

