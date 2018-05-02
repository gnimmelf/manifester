const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/schemas'));

const onGlobPatternNext = (req, res, next) => !~req.params.schemaName.indexOf("*") ? next() : next('route');

router.get('/:schemaName', onGlobPatternNext, api('getSchema'));
router.get('/:globpattern?', api('getSchemaNames'));

module.exports = router;

/*
http --session=~/tmp/session.json POST :3000/api/schemas
http --session=~/tmp/session.json POST :3000/api/schemas/content.*
http --session=~/tmp/session.json POST :3000/api/schemas/content.article
http --session=~/tmp/session.json POST :3000/api/schemas/content.article.json
*/