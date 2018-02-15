const debug = require('debug')('mf:routes:admin');
const format = require('string-format-obj');
const { readFileSync } = require('fs');
const { join } = require('path');
const { Router } = require('express');
const {
  inspect,
  upquire,
  makeSingleInvoker,
} = require('../../lib');

const router = Router();

const loginSPA = ({ siteService }) => (req, res, next) => {

  try {
    const markup = readFileSync(upquire('/manifester-admin/spa.html', { pathOnly: true }), 'utf8');

    res.send(format(markup, {
      title: siteService.settings.siteName,
      appSettings: JSON.stringify({
        authPath: "/api/auth/",
        apiPath: "/api/",
      }),
      pageBundleName: "login",
      bundlePath: "/public/admin/",
    }));

  } catch(err) {
    next(err);
  }
}

router.get('*', makeSingleInvoker(loginSPA));

module.exports = router;
