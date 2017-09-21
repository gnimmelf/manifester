const debug = require('debug')('routes:admin');
const { join } = require('path');
const { Router } = require('express');
const {
  inspect,
  upquire,
  makeSingleInvoker,
} = require('../../lib');

const router = Router();

const loginForm = ({ templateService, siteService }) => (req, res, next) => {

  templateService['login'].render({
    siteName: siteService.settings.siteName,
    authpath: "/api/auth/",
  })
  .then(markup => res.send(markup))

}

router.get('/', makeSingleInvoker(loginForm));

module.exports = router;
