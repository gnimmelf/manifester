const express = require('express');
const router = express.Router();
const upquire = require('upquire');
const jwt = require('jsonwebtoken');

const upquirePath = upquire('/lib/utils').upquirePath;
const generateCode = upquire('/lib/utils/code-gen');
const sendMail = upquire('/lib/send-mail');

// Sensitive stuff
const hashSecret = upquire('/sensitive/hash-secret');

const siteInfo = upquire('/sensitive/db/site-info.json');

const users = upquire('/lib/json-tree')(upquirePath('/sensitive', 'db/users'), {
  instantPush: true,
});

// Ensure superusers
upquire('/sensitive/credentials/superusers').forEach(superuser => {
  if (!users.get(`${superuser.email}.json`)) {
    users.set(`${superuser.email}.json`, null, superuser);
  }
});


/*
  Routes
*/
router.get('/:email', function(req, res, next) {
  const user = users.get(`${req.params.email}.json`);

  if (!user) {
    res.jsend.fail({
      message: 'Could not find email-address',
      code: 422,
    });
  }
  else {

    const login_code = generateCode();

    users.set(`${req.params.email}.json`, 'loginCode', login_code);

    const context = { loginCode: login_code, domainName: [req.headers.host, siteInfo.siteName].join('|') };

    res.render('login-mailcode', context, (err, html) =>
    {

      if (err) throw err;

      sendMail({
        sender_name: context.domainName,
        reciever_email: req.params.email,
        subject_str: 'Login kode',
        text_or_html: html,
      });

    });

    res.jsend.success({email: req.params.email});
  }

})


router.get('/:email/:code', function(req, res, next) {
  const user = users.get(`${req.params.email}.json`);

  if (!user) {
    res.jsend.fail({
      message: 'Could not find email-address',
      code: 422,
    });
  }
  else {

    if (user.loginCode && user.loginCode === req.params.code) {

      var token = jwt.sign(user, hashSecret, {
        expiresIn: '24h'
      });

      let o = users.delete(`${req.params.email}.json`, 'loginCode')

      console.log('deleted', o)

      res.jsend.success({
        message: 'Enjoy your token!',
        token: token
      })


    }
    else {
      res.jsend.fail({
        message: 'Invalid code',
        code: 422,
      });
    }
  }

});

module.exports = router;