const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/data'));

router.get('/:schemaName/:fieldName?/:fieldValue?', api('getData'));

module.exports = router;