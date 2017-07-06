const dotProp = require('dot-prop');
const isObj = require('is-obj');

// Make `dotProp.set` return `obj` and accept empty `path`
const dotProp_set = dotProp.set;
dotProp.set = (obj, path, value) => {
  if (path) {
    dotProp_set(obj, path, value);
  }
  else if (isObj(value)){
    Object.assign(obj, value);
  }
  return obj;
}
module.exports = dotProp;