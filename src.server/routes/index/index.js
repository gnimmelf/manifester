const readFileSync = require('fs').readFileSync;
const path = require('path');
const join = path.join;
const express = require('express');

const upquire = require('upquire');
const utils = upquire('/lib/utils');


// Package settings
const settings = require('upquire')('/package.json').settings;

// Get resources from bower components (custom property)
const resources = utils.getBowerComponentsResources(upquire('/bower.json').components, { url_prefix: '/vendor' });

const router = express.Router();

const context = {
  title: 'Manifester loading...',
  styles: {
    'vendors': resources.styles,
    'bundles': [
      join(settings.url_dist_client, '/bundle.css'),
    ],
  },
  scripts: {
    vendors: resources.scripts,
    bundles: [
      join(settings.url_dist_client, '/pre.bundle.js'),
      join(settings.url_dist_client, '/main.bundle.js'),
    ]
  }
}

/* GET home page. */
router.get('/', function(req, res, next)
{
  res.render(require.resolve('./tpl.hbs'), context);
});

module.exports = router;
