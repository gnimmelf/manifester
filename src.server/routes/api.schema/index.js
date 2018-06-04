const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/schema'));

router.get('/list/:globpattern?/:operation?', api('getSchemaNames'));
router.get('/:schemaName',                    api('getSchema'));

module.exports = router;

/*
http --session=~/tmp/session.json POST :3000/api/schemas/list
http --session=~/tmp/session.json POST :3000/api/schemas/content.*
http --session=~/tmp/session.json POST :3000/api/schemas/content.article
http --session=~/tmp/session.json POST :3000/api/schemas/content.article.json
*/