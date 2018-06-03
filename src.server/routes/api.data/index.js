const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/data'));

router.get('/:schemaName/list',                   api('getObjectIds'));
router.get('/:schemaName/:objId',                 api('getObj'));
router.post('/:schemaName/:objId?/:dottedPath?',  api('setObj'));
router.delete('/:schemaName/:objId/:dottedPath?', api('deleteObj'))

module.exports = router;

/*
http --session=~/tmp/session.json :3000/api/data/content.article/list
http --session=~/tmp/session.json :3000/api/data/content.article/b-test
http --session=~/tmp/session.json :3000/api/data/content.article/b-test.json
*/