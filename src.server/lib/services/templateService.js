const debug = require('debug')('services:templateService');
const assert = require('assert');
const {
  dirname,
  basename,
  extname,
  join,
  resolve,
  normalize
} = require('path');

const viewTemplates ={}


const tryStat = (path) =>
{
  debug('stat "%s"', path);

  try {
    return fs.statSync(path);
  } catch (e) {
    return undefined;
  }
}


const destructureFilePath = (filePath) =>
{
  const parts = {
    dir: dirname(filePath),
    ext: extname(filePath),
    filePath: filePath,
  };
  parts.name = basename(filePath, parts.ext);
  return parts;
}


module.exports = ({ mainExpressApp }) =>
/*
  Serve the templates for admin core functions, like login and mail-templates.
  They should be overridable with fallback to original, and their original context must be hookable to provide
  extra data where overridden templates require it.
*/
{

  const mainAppDirs = [].concat(mainExpressApp.get('views')).reduce((acc, cur) => {
    acc.push(cur);
    return acc;
  }, []);


  const localAppDirs =  [].concat(mainExpressApp.localApp.get('views')).reduce((acc, cur) => {
    acc.push(cur);
    return acc;
  }, []);


  class Template {
    constructor({ name, filePath, ext, dir })
    {
      this.staticHooks = [];
      this.hooks =[];
      this.name = name;
      this.filePath = filePath;
      this.ext = ext;
      this.dir = dir;
    }

    statickHook(fn)
    // Add a static context-hook function
    {
      assert(fn instanceof Function, 'hook is not a function');
      return this.hooks.push(fn);
    }

    hook(fn)
    // Add a context-hook function that is removed after render
    {
      assert(fn instanceof Function, 'hook is not a function');
      this.hooks.push(fn)
      // Chainable
      return this;
    }

    render(context, callback=undefined) {

      return new Promise((resolve, reject) => {

        // Run static hooks
        let renderOptions = this.staticHooks.reduce((ctx, hook, idx) => {
          return hook(ctx) || ctx;
        }, Object.assign({}, context))

        // Run dynamic hooks
        while (this.hooks.length) {
          renderOptions = this.hooks.shift()(Object.assign({}, renderOptions)) || renderOptions;
        }

        const paths = localAppDirs.concat(mainAppDirs).map(dir => join(dir, this.filePath));

        let filePath;
        paths.every(path => {
          filePath = path;
          let stat = tryStat(path);
          // `every` breaks loop on `false`
          return stat && stat.isFile() ? false : true;
        })

        // TODO! Select the app owning the template to render? -Merges correct `app.locals`...?
        mainExpressApp.render(filePath, renderOptions, (err, res) => {
          err ? reject(err) : resolve(res);
          (callback && callback(err, res));
        });
      });

    }
  }


  // Proxy object to allow `set('./path/tpl.ext')`, but not ``
  const proxySetter = (obj, value, prop=undefined) => {
    const parts = destructureFilePath(value)
    if (prop) assert(prop == parts.name, `file basename must match property (${prop}): ${value} `)
    obj[parts.name] = new Template(parts);
    return true;
  }

  const templatesProxy = new Proxy(viewTemplates, {
    get: (obj, prop) => {
      if (prop == 'set') {
        return (value) => {
          return proxySetter(obj, value)
        }
      }

      assert(obj[prop] instanceof Template, `${prop} is not a valid template!` )
      return obj[prop];
    },
    set: (obj, prop, value) => {
      if (prop != 'set') {
        proxySetter(obj, value, prop);
      }
    }
  });

  ['mail-logincode.hbs', 'login.hbs'].forEach(templatesProxy.set)

  return templatesProxy;
}