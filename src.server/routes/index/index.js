const path = require('path');
const join = path.join;
const express = require('express');

const upquire = require('upquire');
const utils = upquire('/lib/utils');


// Package settings
const settings = require('upquire')('/package.json').settings;
const siteInfo = upquire('/sensitive/db/site-info.json');

// Get resources from bower components (custom property)
const resources = utils.getBowerComponentsResources(upquire('/bower.json').components, { url_prefix: '/vendor' });

const router = express.Router();

const context = {
  title: `${siteInfo.siteName} loading...`,
  styles: {
    'vendors': resources.styles,
    'bundles': [
      join(settings.urlDistClient, '/bundle.css'),
    ],
  },
  scripts: {
    vendors: resources.scripts,
    bundles: [
      join(settings.urlDistClient, '/main.bundle.js'),
    ]
  }
}

/* GET home page. */
router.get('/', function(req, res, next)
{
  res.render(require.resolve('./tpl.hbs'), context);
});

module.exports = router;
