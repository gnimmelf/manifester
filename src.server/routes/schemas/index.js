const upquire = require('upquire');
const express = require('express');
const upquirePath = upquire('/lib/utils').upquirePath;
const router = express.Router();

const systemSchemas = upquire('/lib/json-tree')(upquirePath('/system', '/schemas'));
const siteSchemas = upquire('/lib/json-tree')(upquirePath('/sensitive', 'db/schemas'));

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