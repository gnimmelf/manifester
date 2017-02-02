var gutil = require("gulp-util");

// Helpers
var utils = require('../utils');
// Package settings
var settings = require('upquire')('/package.json').settings;

module.exports = function(gulp)
{

  var webpack_compiler = (function (webpack, task_name)
  {
    // Create a single instance of the compiler to allow caching
    var compiler = webpack({
      // Debug + sourcemap config
      devtool: 'eval-cheap-module-source-map',
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
        "$": "jQuery",
        "rx": "Rx",
      },
      plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
      ],
      module: {
        preLoaders: [
          {
            test: /tag.html$/,
            exclude: /node_modules/,
            loader: 'riot-tag-loader',
            query: {
              babelrc: false,
              type: 'es6',
              debug: true,
              sourcemap: true,

            }
          }
        ],
        loaders: [
          { test: /\.js$|tag.html$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
              babelrc: false,
              presets: [
                "es2015-riot",
                "stage-0",
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

  })(require("webpack"), 'client:webpack');

  gulp.task('client:webpack', webpack_compiler);

}
