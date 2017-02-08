var babel = require("gulp-babel");
var sourcemaps = require('gulp-sourcemaps');

// Helpers
var join = require('path').join;
var utils = require('./utils');
var format = require('util').format;
var exec = require('child_process').spawn;
// Package settings
var settings = require('upquire')('/package.json').settings;

function transpileExec(done, task_name, do_watch) {
    var cwd = utils.upquirePath('/package.json');
    // babel path
    var cmd = join('node_modules/.bin', 'babel');
    var args = []
    // src.server
    args.push(settings.dir_src_server)
    // dest.server
    args.push(format('--out-dir %s', settings.dir_dist_server));
    args.push('--source-maps');
    // Presets
    args.push('--presets es2015-node6')
    // Plugins
    //args.push('--plugins transform-es2015-destructuring transform-object-rest-spread')
    // Watch flag
    if (do_watch) { args.push('--watch'); }

    console.log(cwd, cmd, args.join(' ')); //done(); return;

    var child = exec(cmd, args.join(' ').split(' '), {cwd: cwd});

    // Redirect child output
    child.stdout.on('data', function(data) {
        process.stdout.write(data);
    });
    child.stderr.on('data', function(data) {
        process.stdout.write(data);
    });
    child.on('close', function(code) {
        console.log('%s done (code: %s)', task_name, code);
        done();
    });
}

module.exports = function(gulp)
{

  gulp.task('server:clean' , function(done) {
    utils.rmdir(settings.dir_dist_server, done);
  });

  gulp.task('server:transpile:exec' , function(done) {
    transpileExec(done, 'server:transpile:exec')
  })

  gulp.task('server:transpile:exec:watch' , function(done) {
    transpileExec(done, 'server:transpile:exec:watch', true)
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
