var rimraf = require('rimraf');
var path = require('path');

exports.rmdir = function(path, cb) {
  rimraf(path, {glob: false}, cb)
}

exports.streamOnError = function(err) {
  console.error(err.stack);
  this.emit('end');
}

exports.makeOnwarn = function(supress_starts_with)
/**
 * Custom `onwarn` for rollup to suppress annoying warnings.
 */
{
  var warned = {};

  if (typeof supress_starts_with == 'string') {
    supress_starts_with = [supress_starts_with];
  }
  else if (typeof supress_starts_with != 'list') {
   supress_starts_with = [];
  }

  return function (msg)
  {
    if ( msg in warned
      || supress_starts_with.filter(function(sup_msg) {
        return msg.startsWith(sup_msg)
      }).length) { return; }

    console.error( msg ); //eslint-disable-line no-console
    warned[ msg ] = true;
  };
}

exports.join = function()
{
  return './'+(path.join.apply(null, Array.prototype.slice.call(arguments)));
}