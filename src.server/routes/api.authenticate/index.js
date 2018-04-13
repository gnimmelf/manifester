const debug = require('debug')('mf:routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../lib/apis/authenticate'));

router.post('/request', api('requestLoginCodeByEmail'));
router.post('/exchange', api('exchangeLoginCode2Token'));
router.post('/authenticate', api('authenticateToken'));


module.exports = router;