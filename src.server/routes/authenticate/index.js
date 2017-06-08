const express = require('express');
const router = express.Router();
const upquire = require('upquire');
const jwt = require('jsonwebtoken');

const upquirePath = upquire('/lib/utils').upquirePath;
const generateCode = upquire('/lib/utils/code-gen');
const sendMail = upquire('/lib/send-mail');

// Sensitive stuff
const sensitive = upquire('/sensitive');

const db = upquire('/lib/json-tree')(upquirePath('/sensitive', 'db/users'), {
  instantPush: true,
});



/**
 * Routes
 */
router.get('/:email', function(req, res, next) {
  const user = db.get(`${req.params.email}.json`);

  if (!user) {
    res.jsend.fail({
      message: 'Kunne ikke finne e-postaddressen',
      code: 422,
    });
  }
  else {

    const login_code = generateCode();

    db.set(`${req.params.email}.json`, 'loginCode', login_code)

    res.render('login-mailcode', {loginCode: login_code, domainName: req.headers.host}, (err, html) => {

      if (err) throw err;

      sendMail({
        sender_name: 'Økogrenda survey',
        reciever_email: req.params.email,
        subject_str: 'Login kode',
        text_or_html: html,
      });

    });

    res.jsend.success({email: req.params.email});
  }

})


router.get('/:email/:code', function(req, res, next) {
  const user = db.get(`${req.params.email}.json`);

  if (!user) {
    res.jsend.fail({
      message: 'Kunne ikke finne e-postaddressen',
      code: 422,
    });
  }
  else {

    if (user.loginCode === req.params.code) {

      var token = jwt.sign(user, sensitive.secret, {
        expiresIn: '24h'
      });

      res.jsend.success({
        message: 'Enjoy your token!',
        token: token
      })

    }
    else {
      res.jsend.fail({
        message: 'Ugyldig kode',
        code: 422,
      });
    }
  }

});

module.exports = router;