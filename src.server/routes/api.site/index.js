const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const authorizeRequest = require('../../middleware/authorizeRequest');

const router = Router();
const api = makeInvoker(require('../../apis/site'));

router.get('/groups', authorizeRequest({"user": ["read"]}), api('getGroups'));
// Site-data
router.get('/list',                                    api('getObjectIds'));
router.get('/:schemaName/:dottedPath?',                api('getObj'));
router.post('/:schemaName/:dottedPath?',               api('setObj'));
router.delete('/:schemaName/:dottedPath?',             api('setObj'));

module.exports = router;