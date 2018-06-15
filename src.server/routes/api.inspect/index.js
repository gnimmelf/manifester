const debug = require('debug')('routes:api.inspect');
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/inspect'));

router.get('/inspect', api('getEndpoints'));
router.get('/inspect/asHtml', api('getEndpointsAsHtml'));
router.get('/inspect/asText', api('getEndpointsAsText'));

module.exports = router;
