/**
 * Extra `jsonpath`-based methods (Flemming)
 */
DB.prototype.get = function(q_path, max_count)
{
  return this.nodes(q_path, max_count).map(n => n.value);
}


DB.prototype.getOne = function(q_path)
{
  var res = this.get(this.tree, q_path, 1)
  return res.length >= 1 ? res[0] : null;
}


DB.prototype.nodes = function(q_path, max_count)
/**
Each '^' at `q_path` end signifies one parent up; make it so regardless of cost.
*/
{
  let up_count = 0;

  const matches = q_path.match(/(\^+)$/g);

  if (matches) {
    up_count = matches[0].length;
    // Remove '^'-chars at end from `q_path`
    q_path = q_path.slice(0, -up_count)
  }

  let nodes = jp.nodes(this.tree, q_path, max_count);

  if (up_count) {
    const tree = this.tree;
    const nodes2 = nodes.map(node => {
      const q_path2 = node.path.slice(0, -up_count).join('.');
      return jp.nodes(tree, q_path2)
    })
    return nodes2[0]
  }
  return nodes
}

DB.prototype.set = function(q_path) {
  var res = jp.nodes(this.tree, 'json_path', max_count);
  return nodes;
}
