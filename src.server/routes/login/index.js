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

const loginForm = ({ siteService }) => (req, res, next) => {

  try {
    const markup = readFileSync(upquire('/manifester-admin/spa.html', { pathOnly: true }), 'utf8');

    res.send(format(markup, {
      title: 'A manifested site',
      appSettings: JSON.stringify({authPath: "/api/auth/"}),
      pageBundle: 'login',
    }));

  } catch(err) {
    next(err);
  }
}

router.get('*', makeSingleInvoker(loginForm));

module.exports = router;
