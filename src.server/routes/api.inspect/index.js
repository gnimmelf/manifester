const debug = require('debug')('routes:api.inspect');
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/inspect'));

router.get('/:text', api('getEndpoints'));

module.exports = router;
