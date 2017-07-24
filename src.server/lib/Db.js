/**
 * https://github.com/VINTproYKT/node-jsondir-livedb
 */

const assert = require('assert');
const assign = require('deep-assign');
const fs = require('fs');
const mkdirp = require('mkdirp');
const chokidar = require('chokidar');
const { join, dirname, resolve } = require('path');
const { isFunction } = require('util');

const jp = require('jsonpath');
const isObj = require('is-obj');
const writeFile = require('write-file-atomic').sync;
const deleteFile = require('delete').sync;

const dotProp = require('./dotProp')

const tree = {};

const makeDotPropKey = (path) =>
{
  path = path.split('.').join('\\.').split('/').join('.');
  return path.startsWith('.') ? path.substring(1) : path;
}
const dotJoin = (...parts) => parts.filter(x => x).join('.').replace('..', '.');
const stringify = (obj, prettify=true) => (prettify ? JSON.stringify(obj, null, 2) : JSON.stringify(obj));


const updateTreePath = (path, instance) =>
{
  const dotPropKey = makeDotPropKey(path);
  dotProp.set(tree, dotPropKey, JSON.parse(fs.readFileSync(path)));
}


const deleteTreePath = (path, instance) =>
{
  dotProp.delete(tree, dotPropKey(path));
}


const addCommit = ({instance, action, path}) =>
{
  instance.commits.push({
    instance: instance,
    action: action,
    path: path
  });

  if (instance.instantPush) {
    pushCommits(instance);
  }

}


const pushCommits = (instance) => {

  const commits = Array.from(new Set(instance.commits));

  console.log(commits)

  commits.forEach(commit => {
    if (commit.action == 'write') {
      // Write file @ `path` with value from `instance.get(path)`
      const content = dotProp.get(tree, makeDotPropKey(commit.path));
      writeFile(commit.path, stringify(content, instance.prettify));
    }
    else if (commit.action == 'delete') {
      // Delete file @ `path`
      deleteFile(path)
    }

    // Increment the paths pushCount to avoid circularity with watcher file-events
    let pushCount = (instance.treePathPushCounts[commit.path] || 0);
    instance.treePathPushCounts[commit.path] = ++pushCount;

    console.log(instance.treePathPushCounts)
  });
}

class Db {

  constructor({ root, instantPush=false, prettify=true, watchArgs={}, onReady })
  /*
    Start watching whole storage for changes, returns object with `tree`.
    Arguments:
    + options - initial settings
      Required key is `root` is absolute path to storage
      Optional key `instantPush` sets whether any change will be applied to storage instantly
      Optional key `watchArgs` represents options for watcher (https://www.npmjs.com/package/watch#watchwatchtreeroot-options-callback)
      Optional key `prettify` sets whether to write pretty formatted json til files
  */
  {
    assert(root);
    this.root = resolve(root);
    this.instantPush = instantPush;
    this.prettify = prettify;

    Object.assign({
      // https://www.npmjs.com/package/chokidar#api
      persistent: true,
      ignored: /(^|[\/\\])\../,
      ignoreInitial: false,
      followSymlinks: false,
      cwd: this.root,
      usePolling: false,
      useFsEvents: false,
      alwaysStat: false,
      depth: undefined,
      awaitWriteFinish: {stabilityThreshold: 200, pollInterval: 100},
      ignorePermissionErrors: false,
      //atomic: true // = (!usePolling && !useFsEvents)
    }, watchArgs);

    this.commits = [];
    this.treePathPushCounts = {};

    // Prime the instance to the tree
    const treePath = makeDotPropKey(this.root);
    dotProp.set(tree, treePath, {});
    this.tree = dotProp.get(tree, treePath)

    const watcher = this.watcher = chokidar.watch(join(this.root, '**/*.json'), watchArgs);

    this.watcher
      .on('all', this.handleEvent.bind(this))
      .on('error', error => console.log(`Watcher error: ${error}`))
      .on('ready', () => {
        console.log('Initial scan complete. Ready for changes');
        if (isFunction(onReady)) {
          onReady(this.tree);
        }
      });
  }

  handleEvent(event, path) {

    if (this.treePathPushCounts[path]) {
      // Ignore the event, it originated from the `tree` being pushed.
      // Just decrement the pushed path's counter and return.
      this.ignorePaths--;
      return;
    }

    switch (event) {
      case 'change':
      case 'add':
        updateTreePath(path);
        break;
      case 'unlink':
        deleteTreePath(path);
        break;
      case 'addDir':
      case 'unlinkDir':
      default:
        console.error(`unhandled event ${event}`)
    }
  }


  get(path, key, reassign)
  /*
    Get object in tree by `path` or get value from it by `key`
    Arguments:
    + path - relative path to file
    + key - (optional) key to get the value of (will be evaluated)
    + reassign - (optional) make it a new object, i.e. without reference
  */
  {
    if (!path) return this.tree;

    const dotPropPath = makeDotPropKey(path);
    const value = dotProp.get(this.tree, dotJoin(dotPropPath, key));
    return (reassign ? Object.assign({}, value) : value);
  }


  set(path, key='', value=undefined)
  /*
    Set `key`'s value in db, create file if it doesn't exist
    Arguments:
    + path - relative path to file
    + key - (optional) key to set the value of (will be evaluated)
    + value - (optional) number, string, array or object (default: {})
  */
  {
    assert(path);

    if (key && !value) {
      // Assume `key` holds `value`, so swap
      value = key;
      key = '';
    }

    const dotPropPath = makeDotPropKey(path);

    try {
      // Update `tree`
      dotProp.set(this.tree, dotJoin(dotPropPath, key), value);
      // Add commit
      addCommit({
        instance: this,
        action: 'write',
        path: join(this.root, path)
      });
    }
    catch(err) {
      console.error(err); return false;
    }

    return true;
  }


  delete(path, key=undefined)
  /*
    Delete JSON files in `path` directory or file by this path or certain `key` in file if given
    Arguments:
    + path - relative path to file or directory
    + key - (optional) key to delete from file (will be evaluated)
  */
  {
    assert(path);

    const dotPropPath = makeDotPropKey(path);

    try {
      dotProp.delete(this.tree, dotJoin(dotPropPath, key));
      // Add commit, 'delete' (file) if no `key` is specicied for deletion
      addCommit({
        instance: this,
        action: (key ? 'write' : 'delete'),
        path: join(this.root, path)
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