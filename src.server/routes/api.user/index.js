const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/user'));

router.get('/current', api('getCurrentUser'));
router.get('/current/groups', api('getCurrentUserGroups'));
router.get('/logout', api('invalidateSession'));
router.get('/:userHandle/data/:schemaName/list', api('getObjectIds'));
router.get('/:userHandle/data/:schemaName/:objId', api('getData'));
router.post('/:userHandle/data/:schemaName/:objId/:dottedPath?', api('setData'));

module.exports = router;

/*
http --session=~/tmp/session.json :3000/api/user/current
http --session=~/tmp/session.json :3000/api/user/logout
http --session=~/tmp/session.json :3000/api/user/gnimmelf/data/user.blog/list
http --session=~/tmp/session.json :3000/api/user/gnimmelf/data/user.blog/a-test
*/