const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/authenticate'));

router.get('/token/:token?', api('authenticateToken'));
router.get('/:email/:code', api('authenticateLogincode'));
router.get('/:email', api('requestTokenByMail'));


module.exports = router;