const debug = require('debug')('routes:authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/user'));

router.get('/current', api('getCurrentUser'));
router.get('/logout', api('invalidateSession'));

module.exports = router;

/*
http --session=~/tmp/session.json :3000/api/user/current
http --session=~/tmp/session.json :3000/api/user/logout
*/