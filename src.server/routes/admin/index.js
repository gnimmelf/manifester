const path = require('path');
const join = path.join;
const express = require('express');

const authorize = require('../../lib/middleware/authorizeUser');
const { getBowerComponentsResources, upquire } = require('../../lib');
const pathMaps = upquire('/package.json').appSettings.pathMaps;

const siteInfo = {
  // TODO! Swap for DI-container => `dbService.get('siteInfo.json')`...
  //const siteInfo = upquire('/sensitive/db/site-info.json');
};

const router = express.Router();

const getContext = (function(bower_components)
// Get resources from bower components (custom property)
{
  let context = null;

  return (app_mountpath) =>
  // Make context of required vendor resources based on `mount_path`
  {

    if (!context)  {

      const resources = getBowerComponentsResources(bower_components, {
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


/* GET admin page. */
router.get('/', authorize({ groups: ['admins'], redirectUrl: '/login' }), function(req, res, next)
{
  res.render(require.resolve('./tpl.hbs'), getContext(req.app.mountpath));
});

module.exports = router;
