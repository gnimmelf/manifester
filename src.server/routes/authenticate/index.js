const debug = require('debug')('mf:routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../lib/apis/authenticate'));

router.post('/request', api('requestLogincodeByEmail'));
router.post('/exchange', api('exchangeLogincode2Token'));
router.post('/authenticate', api('authenticateToken'));


module.exports = router;