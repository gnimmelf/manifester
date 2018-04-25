const debug = require('debug')('mf:routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/authenticate'));

router.post('/request', api('requestLoginCodeByEmail'));
router.post('/exchange', api('exchangeLoginCode2Token'));
router.post('/authenticate', api('authenticateToken'));

module.exports = router;

/*
http --session=~/tmp/session.json POST :3000/api/auth/request email=gnimmelf@gmail.com
http --session=~/tmp/session.json POST :3000/api/auth/exchange
http --session=~/tmp/session.json POST :3000/api/auth/exchange email=gnimmelf@gmail.com code=06856
*/