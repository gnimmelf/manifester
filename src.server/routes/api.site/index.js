const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/site'));

router.get('/list', api('getObjectIds'));
router.get('/:siteSchemaSuffix/:dottedPath?', api('getObj'));
router.post('/:siteSchemaSuffix/:dottedPath?', authorizeRequest({"manager": ["write"]}), api('setObj'));

module.exports = router;