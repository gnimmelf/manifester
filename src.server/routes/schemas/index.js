const upquire = require('upquire');
const express = require('express');
const upquirePath = upquire('/lib/utils').upquirePath;
const router = express.Router();
const jsonTree = upquire('/lib/json-tree');

const systemSchemas = jsonTree(upquirePath('/system', '/schemas'));
const siteSchemas = jsonTree(upquirePath('/sensitive', 'db/schemas'));

/*
  Routes
  - Always prioritise system schemas
*/
router.get('/', (req, res) => {
  const schemas = Object.assign({}, siteSchemas.tree, systemSchemas.tree)

  console.log(systemSchemas.tree)

  res.jsend.success(schemas);
})

router.get('/:id', (req, res) => {
  const schema = (systemSchemas.get(`${req.params.id}.json`) || siteSchemas.get(`${req.params.id}.json`));
  schema ?
    res.jsend.success(schema) :
    res.jsend.fail({
      message: 'Schema not found',
      code: 404,
    })
})

module.exports = router;