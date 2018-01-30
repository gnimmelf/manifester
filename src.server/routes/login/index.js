const debug = require('debug')('mf:routes:admin');
const { join } = require('path');
const { Router } = require('express');
const {
  inspect,
  upquire,
  makeSingleInvoker,
} = require('../../lib');

const router = Router();

const loginForm = ({ templateService, siteService }) => (req, res, next) => {

  templateService['single-page-app'].render({
    title: siteService.settings.siteName,
    appSettings: JSON.stringify({
      authpath: "/api/auth/",
    }),
    scripts: {
      vendors: [
        "//cdnjs.cloudflare.com/ajax/libs/rxjs/5.5.2/Rx.min.js",
        "//cdnjs.cloudflare.com/ajax/libs/react/15.3.1/react-with-addons.min.js",
        "//cdnjs.cloudflare.com/ajax/libs/react/15.3.1/react-dom.min.js",
        "//cdnjs.cloudflare.com/ajax/libs/prop-types/15.6.0/prop-types.min.js",
        "//grommet.io/assets/latest/grommet.min.js",
      ],
      bundles: ["/public/admin/login.js"],
    },
    styles: {
      vendors: [
        "http://grommet.io/assets/latest/css/grommet.min.css"
      ],
      bundles: [],
    },
  })
  .then(markup => res.send(markup))
  .catch(next);
}

router.get('/', makeSingleInvoker(loginForm));

module.exports = router;
