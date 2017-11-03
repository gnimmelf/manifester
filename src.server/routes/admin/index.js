
// TODO! Move all admin frontend stuff to own repo!

const debug = require('debug')('routes:admin');
const { join } = require('path');
const { Router } = require('express');
const {
  upquire,
  makeSingleInvoker,
} = require('../../lib');
const authorize = require('../../lib/middleware/authorizeUser');

const router = Router();

const spa = ({ siteService }) => (req, res, next) => {
  res.render('single-page-app.hbs', {
    title: siteService.settings.siteName,
    scripts: {
      vendors: [],
      bundles: ["/public/admin/bundle.js"],
    },
    styles: {
      vendors: [],
      bundles: ["/public/admin/main.css"],
    },
  });
}

router.get('/', authorize({ groups: ['admins'] }), makeSingleInvoker(spa));

module.exports = router;
