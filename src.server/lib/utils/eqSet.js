const eqSet = (set_a, set_b) =>
{
  set_a instanceof Set ? null : set_a = new Set(set_a);
  set_b instanceof Set ? null : set_b = new Set(set_b);
  return set_a.size === set_b.size && all(isIn(set_a), set_b);
}


const all = (pred, set_a) =>
{
  for (var a of set_a) if (!pred(a)) return false;
  return true;
}


const isIn = (set_a) =>
{
  return function (a) {
    return set_a.has(a);
  };
}

module.exports = eqSet;