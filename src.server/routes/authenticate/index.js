const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../lib/apis/authenticate'));

router.get('/token/:token?', api('authenticateToken'));
router.get('/:email/:code', api('authenticateLogincode'));
router.get('/:email', api('requestLogincodeByEmail'));


module.exports = router;