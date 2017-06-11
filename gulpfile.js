var gulp = require('gulp');
var runSequence = require('run-sequence');

// NOTE! Bower components are linked to directly 'as is' from within the html-templates
//var bowerFiles = require('main-bower-files');

// Helpers
var join = require('path').join;

var settings = require('./package.json').settings;

require('./gulp_tasks/client')(gulp);

/**
 * Default task - call gulp and its done
 */

gulp.task('default', ['client:build']);

gulp.task('clean', ['client:clean']);

gulp.task('client:build', ['client:clean'], function() {
  runSequence([
    'client:postcss',
    'client:rollup',
  ]);

});

gulp.task('client:watch', ['client:build'], function(done) {

  gulp.watch([
    join(settings.dirSrcClient, '**', '*.css')
  ] , ['client:postcss']);

  gulp.watch([
    join(settings.dirSrcClient, '**', '*.js'),
    join(settings.dirSrcClient, '**', '*tag.html'),
  ] , ['client:rollup']);

});
