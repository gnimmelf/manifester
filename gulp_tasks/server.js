var babel = require("gulp-babel");
var sourcemaps = require('gulp-sourcemaps');

// Helpers
var join = require('path').join;
var utils = require('./utils');
var format = require('util').format;
var upquire = require('upquire')
var exec = require('child_process').spawn;
// Package settings
var settings = require('../package.json').settings;

function transpileExec(done, doWatch) {
    var cmd = '%s/babel'
    var args = '%s --out-dir %s --source-maps'
    // babel path
    cmd = format(cmd, 'node_modules/.bin');
    // src.server
    args = format(args, settings.dir_src_server);
    // dest.server
    args = format(args, settings.dir_dist_server);
    // Watch flag
    if (doWatch) { args+=' --watch'; }

    //console.log(cmd, args); done(); return;

    var child = exec(cmd, args.split(' '), {cwd: upquire('/package.json', {pathOnly: true, dirname: true})});

    // Redirect child output
    child.stdout.on('data', function(data) {
        console.log(''+data);
        //Here is where the output goes
    });
    child.stderr.on('data', function(data) {
        console.log(''+data);
        //Here is where the error output goes
    });
    child.on('close', function(code) {
        console.log('Done (code: %s)', code);
        done();
    });
}

module.exports = function(gulp)
{

  gulp.task('server:clean' , function(done) {
    utils.rmdir(settings.dir_dist_server, done);
  });

  gulp.task('server:transpile:exec' , function(done) {
    transpileExec(done)
  })

  gulp.task('server:transpile:exec:watch' , function(done) {
    transpileExec(done, true)
  })

  gulp.task('server:transpile:gulp' , function(done) {
    return gulp.src(
      join(process.cwd(),settings.dir_src_server, '**', '*.js'))
      .pipe(sourcemaps.init())
      .pipe(babel({
        babelrc: false,
        presets: ["node5"],
        plugins: ["external-helpers"],
      }))
      .on('error', utils.streamOnError)
      .pipe(sourcemaps.write('.', { sourceRoot: settings.dir_src_server }))
      .pipe(gulp.dest(settings.dir_dist_server));
  });
}
