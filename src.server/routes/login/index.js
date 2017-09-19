const debug = require('debug')('routes:admin');
const { join } = require('path');
const { Router } = require('express');
const {
  upquire,
  makeSingleInvoker,
  bowerComponentsResources,
} = require('../../lib');

const router = Router();

const staticResources = {
  styles: {
    'vendors': bowerComponentsResources.styles,
    'bundles': [],
  },
  scripts: {
    vendors: bowerComponentsResources.scripts,
    bundles: [
      '/login-spa/bundle.js'
    ]
  }
};

const loginForm = ({ siteService }) => (req, res, next) => {
  res.render('single-page-app.hbs', Object.assign({ title: siteService.settings.siteName }, staticResources));
}

router.get('/', makeSingleInvoker(loginForm));

module.exports = router;
