const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const authorizeRequest = require('../../middleware/authorizeRequest');

const router = Router();
const api = makeInvoker(require('../../apis/site'));

router.get('/settings', api('getSettings'));
router.get('/groups', authorizeRequest({"user": ["read"]}), api('getGroups'));

module.exports = router;