const upquire = require('upquire');
const express = require('express');
const router = express.Router();
const jsonTree = upquire('/lib/json-tree');

/*
  Routes
  - Always prioritise system schemas
*/
router.get('/', (req, res) => {
  const schemas = serviceLoacator.db.schemas;

  console.log(systemSchemas.tree)

  res.jsend.success(schemas);
})

router.get('/:id', (req, res) => {
  const schemas = serviceLoacator.db.schemas;

  const schema = (systemSchemas.get(`${req.params.id}.json`) || siteSchemas.get(`${req.params.id}.json`));

  schema ?
    res.jsend.success(schema) :
    res.jsend.fail({
      message: 'Schema not found',
      code: 404,
    })
})

module.exports = router;