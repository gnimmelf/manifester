const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const authorizeRequest = require('../../middleware/authorizeRequest');

const router = Router();
const api = makeInvoker(require('../../apis/site'));

router.get('/groups', authorizeRequest({"user": ["read"]}), api('getGroups'));
// Site-data
router.get('/list',                                    api('getObjectIds'));
router.get('/:siteSchemaPart/:dottedPath?',                api('getObj'));
router.post('/:siteSchemaPart/:dottedPath?',               api('setObj'));
router.delete('/:siteSchemaPart/:dottedPath?',             api('setObj'));

module.exports = router;