const debug = require('debug')('mf:routes:api.data')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const apiData = makeInvoker(require('../../apis/data'));
const apiSingleton = makeInvoker(require('../../apis/singleton'));

// Data
router.get('/content/:schemaNameSuffix/list', apiData('getObjectIds'));
router.get('/content/:schemaNameSuffix/:objId/:dottedPath?', apiData('getObj'));
router.post('/content/:schemaNameSuffix/:objId?/:dottedPath?', apiData('setObj'));
router.delete('/content/:schemaNameSuffix/:objId/:dottedPath?', apiData('deleteObj'))

// Singletons 
// TODO! `apis/singleton` and `singletonService`
router.get('/singleton/:dbKey/list/:globpattern?', apiSingleton('getObjectIds'));
router.get('/singleton/:dbKey/:schemaNameSuffix/:dottedPath?', apiSingleton('getObj'));
router.post('/singleton/:dbKey/:schemaNameSuffix/:dottedPath?', apiSingleton('setObj'));

module.exports = router;

/*
http --session=~/tmp/session.json GET :3000/api/data/content/article/list
http --session=~/tmp/session.json GET :3000/api/data/content/article/a-test
http --session=~/tmp/session.json GET :3000/api/data/content/article/a-test.json

http --session=~/tmp/session.json GET :3000/api/data/singleton/site/list
*/