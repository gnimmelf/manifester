const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/data'));

router.get('/:schemaName/:fileId?', api('getData'));
router.post('/:schemaName/:fileId/:dottedPath?', api('setData'));

module.exports = router;

/*
http --session=~/tmp/session.json :3000/api/data/article/content.article/a-test
http --session=~/tmp/session.json :3000/api/data/article/content.article/a-test.json
*/