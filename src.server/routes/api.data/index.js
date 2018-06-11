const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const apiData = makeInvoker(require('../../apis/data'));
const apiSingleton = makeInvoker(require('../../apis/singleton'));

// Data
router.get('/:dbKey/:schemaNameSuffix/list', apiData('getObjectIds'));
router.get('/:dbKey/:schemaNameSuffix/:objId/:dottedPath?', apiData('getObj'));
router.post('/:dbKey/:schemaNameSuffix/:objId?/:dottedPath?', apiData('setObj'));
router.delete('/:dbKey/:schemaNameSuffix/:objId/:dottedPath?', apiData('deleteObj'))

// Singletons
router.get('/singleton/:dbKey/list', apiSingleton('getObjectIds'));
router.get('/singleton/:dbKey/:schemaNameSuffix/:dottedPath?', apiSingleton('getObj'));
router.post('/singleton/:dbKey/:schemaNameSuffix/:dottedPath?', apiSingleton('setObj'));

module.exports = router;

/*
http --session=~/tmp/session.json :3000/api/data/content.article/list
http --session=~/tmp/session.json :3000/api/data/content.article/b-test
http --session=~/tmp/session.json :3000/api/data/content.article/b-test.json
*/