const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../lib/apis/schemas'));

const onGlobPatternNext = (req, res, next) => !~req.params.schemaName.indexOf("*") ? next() : next('route');

router.get('/:schemaName', onGlobPatternNext, api('getSchema'));

router.get('/:globpattern?', api('getSchemaNames'));

module.exports = router;