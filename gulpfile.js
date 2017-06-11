var gulp = require('gulp');
var runSequence = require('run-sequence');

// Helpers
var join = require('path').join;
const pathMaps = require('./package.json').appSettings.pathMaps;

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
    join(pathMaps.srcClient.dir, '**', '*.css')
  ] , ['client:postcss']);

  gulp.watch([
    join(pathMaps.srcClient.dir, '**', '*.js'),
    join(pathMaps.srcClient.dir, '**', '*tag.html'),
  ] , ['client:rollup']);

});
