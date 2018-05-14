const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/data'));

router.get('/:schemaName/:fileId?', api('getData'));
router.post('/:schemaName/:dottedKey?/:filterValue?', api('setData'));

module.exports = router;