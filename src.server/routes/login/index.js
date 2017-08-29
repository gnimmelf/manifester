const debug = require('debug')('routes:admin')
const { Router } = require('express');
const { makeSingleInvoker } = require('../../lib');

const router = Router();

const loginForm = ({ siteService }) => (req, res, next) => res.render('login', siteService.settings);

router.get('/', makeSingleInvoker(loginForm));

module.exports = router;
