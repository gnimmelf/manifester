const readFileSync = require('fs').readFileSync;
const join = require('path').join;
const express = require('express');

const upquire = require('upquire');
const interpolate = upquire('/lib/utils').interpolate;
const settings = upquire('/package.json').settings;

const router = express.Router();

const context = {
  title: 'Manifester loading...',
  scripts: {
    vendors: [
      '/vendor/riot/riot.js',
      '/vendor/rxjs/dist/rx.lite.js',
      '/vendor/jquery/dist/jquery.js',
      '/vendor/bootstrap/dist/js/bootstrap.js'
    ],
    bundles: [
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
