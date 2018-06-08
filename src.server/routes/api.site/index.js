const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/site'));

const authorizeRequest = require('../../middleware/authorizeRequest');

router.get('/list', api('getObjectIds'));
router.get('/:siteSchemaSuffix/:dottedPath?', api('getObj'));
router.post('/:siteSchemaSuffix/:dottedPath?', api('setObj'));
// Groups
router.get('/group/list', authorizeRequest(["user"]), api('getGroupList'));
router.get('/group/:key', authorizeRequest(["user"]), api('getGroup'));

module.exports = router;