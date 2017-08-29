const debug = require('debug')('routes:admin')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../lib/apis/admin'));

router.get('/', api('authenticateToken'));


module.exports = router;
