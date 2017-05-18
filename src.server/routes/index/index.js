import { readFileSync } from 'fs';
import { join } from 'path';
import express from 'express'
import { router } from 'express'
import { interpolate } from '../../lib/utils'



const data = {
  title: 'Manifester loading...',
  scripts: {
    head: [
      '/riot/riot.js',
      '/rxjs/dist/rx.lite.js',
      '/jquery/dist/jquery.js',
      '/bootstrap/dist/js/bootstrap.js'
    ],
    bundles: [
      '/vendor/dist/bundle.js'
    ]
  }
}

const html = interpolate(readFileSync(join(__dirname, 'tag.html'), 'utf8'));

/* GET home page. */
router.get('/', function(req, res, next)
{
  res.send(html);
});

module.exports = router;
