const express = require('express');
const upquire = require('upquire');
const upquirePath = upquire('/lib/utils').upquirePath;

const db = upquire('/lib/json-tree')(upquirePath('/sensitive', 'db/schemas'))
const router = express.Router();



router.get('/', (req, res) => {
  console.log(db.tree)

  res.send(JSON.stringify(db.tree))
})

router.get('/:id', (req, res) => {
  res.send(db.get(`${req.params.id}.json`))
})

module.exports = router;