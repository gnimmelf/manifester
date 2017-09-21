
// TODO! Move all admin frontend stuff to own repo!

const debug = require('debug')('routes:admin');
const { join } = require('path');
const { Router } = require('express');
const {
  upquire,
  makeSingleInvoker,
  bowerComponentsResources,
} = require('../../lib');
const authorize = require('../../lib/middleware/authorizeUser');

const router = Router();

const loginForm = ({ siteService }) => (req, res, next) => {
  res.render('move-to-own-repo.hbs', { title: siteService.settings.siteName });
}

router.get('/', authorize({ groups: ['admins'], redirectUrl: '/login' }), makeSingleInvoker(loginForm));

module.exports = router;
