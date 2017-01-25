var gulp = require('gulp');
var gutil = require("gulp-util");

// Helpers
var utils = require('./utils');
// Package settings
var settings = require('../package.json').settings;

module.exports = function(gulp)
{

  gulp.task('client:clean' , (done) =>
  {
    utils.rmdir(settings.dir_dist_client, done);
  });

  gulp.task('client:postcss' , (done) =>
  {
    var postcss       = require('gulp-postcss');
    var autoprefixer  = require('autoprefixer');
    var postcssNext   = require('postcss-cssnext');
    var concat        = require('gulp-concat');
    var sourcemaps    = require('gulp-sourcemaps');

    return gulp.src(utils.join(settings.dir_src_client, '**', '*.css'))
      .pipe(sourcemaps.init())
      .pipe(postcss([
        postcssNext(),
      ]))
      .on('error', utils.streamOnError)
      .pipe(gulp.dest(settings.dir_dist_client))
      .pipe(sourcemaps.write('.'))
      .pipe(concat('styles.css'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(settings.dir_dist_client))
  });

  var webpack_compiler = (function (webpack, task_name)
  {
    // Create a single instance of the compiler to allow caching
    var compiler = webpack({
      // Debug + sourcemap config
      devtool: "sourcemap",
      debug: true,
      // Standard configs
      entry: utils.join(settings.dir_src_client, 'main.js'),
      output: {
        path: settings.dir_dist_client,
        publicPath: '/',
        filename: 'bundle.js'
      },
      externals: {
        "riot": "riot",
        "jquery": "jQuery",
        "rx": "rx",
      },
      plugins: [
        new webpack.optimize.OccurenceOrderPlugin()
      ],
      module: {
        preLoaders: [
          {
            test: /tag.html$/,
            exclude: /node_modules/,
            loader: 'riot-tag-loader',
            query: {
              type: 'es6',
              debug: true,
            }
          }
        ],
        loaders: [
          { test: /\.js$|tag.html$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
              presets: [
                "es2015-riot",
                "stage-1",
              ],
            }
          }
        ]
      }
    });

    // Return funtion to run compiler
    return function(done)
    {
      compiler.run(function(err, stats) {
        if(err) {
          throw new gutil.PluginError(task_name, err);
        }
        gutil.log(task_name, stats.toString({
          colors: true
        }));
        done();
      });
    };

  })(require("webpack"), 'client:webpack:bundle');

  gulp.task('client:webpack:bundle', webpack_compiler);

}

/*
gulp.task('client:riot:compile', (done) =>
{
  var riot          = require('gulp-riot');
  var sourcemaps    = require('gulp-sourcemaps');

  return gulp.src(join(settings.dir_src_client, '**', '*tag.html'))
    .pipe(sourcemaps.init())
    .pipe(riot({
        entry: join(settings.dir_src_client, 'main.js'),
        presets: ['es2015-riot'],
        ext: 'html',
          type: 'none'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(settings.dir_dist_client))
});


gulp.task('client:rollup:bundle', ['client:riot:compile'], (done) => {
  var rollup        = require('gulp-better-rollup');
  var riot          = require('rollup-plugin-riot');
  var babel         = require('rollup-plugin-babel');
  var json          = require('rollup-plugin-json');
  var nodeResolve   = require('rollup-plugin-node-resolve');
  var commonjs      = require('rollup-plugin-commonjs');
  var rename        = require('gulp-rename');
  var sourcemaps    = require('gulp-sourcemaps');

  return gulp.src(join(settings.dir_src_client, 'main.js'))
    .pipe(sourcemaps.init())
    .pipe(rollup({
      // Rollup options
      // https://github.com/rollup/rollup/wiki/JavaScript-API#rolluprollup-options-
      plugins: [
        json(),
        riot({
          ext: 'html',
          type: 'none'
        }),
        nodeResolve({
          jsnext: true,
          main: true,
          browser: true
        }),
        commonjs(),
        babel({
          babelrc: false,
          presets: ["es2015-rollup"]
        })
      ],
      external: [
        'riot',
        'jquery',
        'rx'
      ],
      globals: {
        riot: 'riot',
        jquery: '$',
        rx: 'Rx',
      },
      //onwarn: utils.makeOnwarn("Sourcemap is likely to be incorrect:")
    }, {
      // Bundle generate options
      // https://github.com/rollup/rollup/wiki/JavaScript-API#bundlegenerate-options-
       format: 'iife',
    }))
    .on('error', utils.streamOnError)
    .pipe(rename('bundle.js'))
    .pipe(sourcemaps.write('.') {

    })
    .pipe(gulp.dest(settings.dir_dist_client));
});
*/