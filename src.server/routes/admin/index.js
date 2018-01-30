
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

  templateService['single-page-app'].render({
    title: siteService.settings.siteName,
    scripts: {
      vendors: ["https://code.jquery.com/jquery-2.2.4.min.js"],
      bundles: ["/public/admin/admin.js"],
    },
    styles: {
      vendors: [],
      bundles: ["/public/admin/index.css"],
    },
  })
  .then(markup => res.send(markup))
}

router.get('/', authorize({ groups: ['admins'] }), makeSingleInvoker(spa));

module.exports = router;
