const path = require('path');
const join = path.join;
const express = require('express');
const upquire = require('upquire');

const utils = upquire('/lib/utils');
const pathMaps = upquire('/package.json').appSettings.pathMaps;
const siteInfo = upquire('/sensitive/db/site-info.json');

const router = express.Router();

const getContext = (function(bower_components)
// Get resources from bower components (custom property)
{
  let context = null;

  return (app_mountpath) => {

    if (!context)  {

      const resources = utils.getBowerComponentsResources(bower_components, {
        url_prefix: join(app_mountpath, pathMaps.vendors.url)
      });

      context = {
        title: `${siteInfo.siteName} loading...`,
        styles: {
          'vendors': resources.styles,
          'bundles': [
            join(app_mountpath, pathMaps.distClient.url, '/bundle.css'),
          ],
        },
        scripts: {
          vendors: resources.scripts,
          bundles: [
            join(app_mountpath, pathMaps.distClient.url, '/main.bundle.js'),
          ]
        }
      }
    }

    return context;

  }

})(upquire('/bower.json').components);


/* GET home page. */
router.get('/', function(req, res, next)
{
  res.render(require.resolve('./tpl.hbs'), getContext(req.app.mountpath));
});

module.exports = router;
