const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/site'));

const authorizeRequest = require('../../middleware/authorizeRequest');

router.get('/list', api('getObjectIds'));
router.get('/:siteSchemaSuffix/:dottedPath?', api('getObj'));
router.post('/:siteSchemaSuffix/:dottedPath?', api('setObj'));

module.exports = router;

/*
http --session=~/tmp/gnimmelf.json :3000/api/site/settings.private/title
http --session=~/tmp/gnimmelf.json :3000/api/site/groups
http --session=~/tmp/gnimmelf.json :3000/api/site/groups/0
*/