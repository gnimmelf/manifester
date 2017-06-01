const rimraf = require('rimraf');
const path = require('path');
const upquire = require('upquire')

exports.rmdir = function(path, cb)
{
  rimraf(path, {glob: false}, cb)
}


exports.streamOnError = function(err)
{
  console.error(err.stack);
  this.emit('end');
}


exports.upquirePath = function(some_path)
{
  return upquire(some_path, { pathOnly: true, dirnameOnly: true })
}


exports.makeOnwarn = function(supress_starts_with)
/**
 * Custom `onwarn` for rollup to suppress annoying, unfixable warnings.
 */
{
  const warned = {};

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
  return (path.join.apply(null, Array.prototype.slice.call(arguments)));
}

exports.getBowerComponentsGlobals = (bower_components) =>
{
  return Object.entries(bower_components)
    .reduce((globals, component) => {
      const entry = component[1].rollup_external;

      if (entry) {
        Object.entries(entry)
          .forEach(entry_as_array => globals[entry_as_array[0]] = entry_as_array[1])
      }
      return globals;
    }, {});
}