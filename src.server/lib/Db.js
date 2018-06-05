/**
  Inspiration: https://github.com/VINTproYKT/node-jsondir-livedb

  TODO! Check to use the NoSQL DB from total.js (`./nosql.js`) or any other "embedded (JS?) NoSQL" db?
 */
const debug = require('debug')('mf:db');
const assert = require('assert');
const assign = require('deep-assign');
const fs = require('fs');
const mkdirp = require('mkdirp');
const chokidar = require('chokidar');
const { join, dirname, resolve } = require('path');
const { isFunction } = require('util');

const isObj = require('is-obj');
const writeFile = require('write-file-atomic').sync;
const deleteFile = require('delete').sync;

const dotProp = require('./dotProp');

const { inspect } = require('./');

const tree = {};

const makeDotPath = (path) =>
{
  path = path.split('.').join('\\.').split('/').join('.');
  return path.startsWith('.') ? path.substring(1) : path;
}
const dotJoin = (...parts) => parts.filter(x => x).join('.').replace('..', '.');
const stringify = (obj, prettify=true) => (prettify ? JSON.stringify(obj, null, 2) : JSON.stringify(obj));


const updateTreePath = (absPath, instance) =>
{
  try {
    const content = JSON.parse(fs.readFileSync(absPath));
    const dotPropKey = makeDotPath(absPath);
    dotProp.set(tree, dotPropKey, content);
  }
  catch(err) {
    console.error(err.message, absPath)
  }
}


const deleteTreePath = (absPath, instance) =>
{
  const dotPropKey = makeDotPath(absPath);
  dotProp.delete(tree, dotPropKey);
}


const addCommit = ({instance, action, absPath}) =>
{
  instance.commits.push({
    instance: instance,
    action: action,
    absPath: absPath
  });

  debug('commits pending', instance.commits)

  if (instance.instantPush) {
    pushCommits(instance);
  }

}


const pushCommits = (instance) => {

  const commits = Array.from(new Set(instance.commits));

  commits.forEach(commit => {
    if (commit.action == 'write') {
      // Write file @ `absPath` with value from `instance.get(path)`
      const content = dotProp.get(tree, makeDotPath(commit.absPath));
      writeFile(commit.absPath, stringify(content, instance.prettify));
    }
    else if (commit.action == 'delete') {
      // Delete file @ `absPath`
      deleteFile(commit.absPath)
    }

    // Increment the paths pushCount to avoid circularity with watcher file-events
    let pushCount = (instance.treePathPushCounts[commit.absPath] || 0);
    instance.treePathPushCounts[commit.absPath] = ++pushCount;
  });
}

class Db {

  constructor({ root, instantPush=false, prettify=true, watchArgs={}, name='' })
  /*
    Start watching whole storage for changes, returns object with `tree`.
    Arguments:
    + options - initial settings
      Required key is `root` is absolute path to storage
      Optional key `instantPush` sets whether any change will be applied to storage instantly
      Optional key `watchArgs` represents options for watcher
      Optional key `prettify` sets whether to write pretty formatted json til files
  */
  {
    assert(root);

    this.root = resolve(root);
    this.instantPush = instantPush;
    this.prettify = prettify;
    this.name = name;

    watchArgs = Object.assign({
      // https://www.npmjs.com/package/chokidar#api
      persistent: true,
      ignored: /(^|[\/\\])\../,
      ignoreInitial: false,
      followSymlinks: false,
      // cwd: '.',
      usePolling: false,
      useFsEvents: false,
      alwaysStat: false,
      depth: undefined,
      awaitWriteFinish: {stabilityThreshold: 200, pollInterval: 100},
      ignorePermissionErrors: false,
      atomic: true // = (!usePolling && !useFsEvents)
    }, watchArgs);

    this.commits = [];
    this.treePathPushCounts = {};

    // Connect the "instance-tree" to the `tree`
    const rootDotPath = makeDotPath(this.root);
    dotProp.set(tree, rootDotPath, {});
    this.tree = dotProp.get(tree, rootDotPath)

    const watcher = this.watcher = chokidar.watch(join(this.root, '**/*.json'), watchArgs);

    // Make a promise
    const self = this;
    this.promise = new Promise(resolve => {

      watcher
        .on('all', this.handleEvent.bind(this))
        .on('error', error => {
          // Chokidar ENOSPC error: https://stackoverflow.com/a/17437601/1008905
          console.warn(`Watcher error: ${error}`)
        })
        .on('ready', () => {
          console.log('Initial scan complete. Ready for changes');
          resolve(self);
          //inspect(self)
        });

    });

  }

  handleEvent(event, absPath) {

    if (this.treePathPushCounts[absPath]) {
      debug('ignored', event, absPath)
      // Ignore the event, it originated from the `tree` being pushed.
      // Just decrement the pushed path's counter and return.
      --this.treePathPushCounts[absPath];
      return;
    }

    debug(event, absPath)

    switch (event) {
      case 'change':
      case 'add':
        updateTreePath(absPath);
        break;
      case 'unlink':
        deleteTreePath(absPath);
        break;
      case 'addDir':
      case 'unlinkDir':
      default:
        console.error(`unhandled event: ${event} [${absPath}]`)
    }
  }


  get(relPath, key, reassign=true)
  /*
    Get object in tree by `relPath` or get value from it by `key`
    Arguments:
    + relPath - relative path to file
    + key - (optional) key to get the value of (will be evaluated)
    + reassign - (optional) make it a new object, i.e. without reference
  */
  {
    if (!relPath) return this.tree;

    const dotPath = makeDotPath(relPath);
    const value = dotProp.get(this.tree, dotJoin(dotPath, key));

    let retVal;

    if (!reassign || typeof value != 'object') {
      // Primitives
      retVal = {
        key: key,
        value: value,
      };
    }
    else {
      // Object or array
      retVal = value ? Object.assign({}, value) : false;
    }

    return retVal;
  }


  set(relPath, key='', value=undefined)
  /*
    Set `key`'s value in db, create file if it doesn't exist
    Arguments:
    + relPath - relative path to file
    + key - (optional) key to set the value of (will be evaluated)
    + value - (optional) number, string, array or object (default: {})
  */
  {
    assert(relPath);

    if (key && value == undefined) {
      // Assume `key` holds `value`, so swap
      value = key;
      key = '';
    }

    const dotPath = makeDotPath(relPath);

    try {
      // Update `tree`
      dotProp.set(this.tree, dotJoin(dotPath, key), value);
      // Add commit
      addCommit({
        instance: this,
        action: 'write',
        absPath: join(this.root, relPath)
      });
    }
    catch(err) {
      console.error(err); return false;
    }

    return true;
  }


  delete(relPath, key=undefined)
  /*
    Delete JSON files in `relPath` directory or file by this path or certain `key` in file if given
    Arguments:
    + relPath - relative path to file or directory
    + key - (optional) key to delete from file (will be evaluated)
  */
  {
    assert(relPath);

    const dotPath = makeDotPath(relPath);

    try {
      dotProp.delete(this.tree, dotJoin(dotPath, key));
      // Add commit, 'delete' (file) if no `key` is specicied for deletion
      addCommit({
        instance: this,
        action: (key ? 'write' : 'delete'),
        absPath: join(this.root, relPath)
      });
    }
    catch(err) {
      console.error(err); return false;
    }

    return true;
  }


  push()
  /* */
  {
    pushCommits(this);
  }

};

module.exports = Db;