const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const api = makeInvoker(require('../../apis/authenticate'));
const router = Router();

router.get('/token/:token?', api('authenticateToken'));
router.get('/:email', api('requestTokenByMail'));
router.get('/:email/:code', api('authenticateLogincode'));


module.exports = router;