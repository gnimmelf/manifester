const express = require('express');
const router = express.Router();
const upquire = require('upquire');
const upquirePath = upquire('/lib/utils').upquirePath;
const generateCode = upquire('/lib/utils/code-gen');

const db = upquire('/lib/json-tree')(upquirePath('/sensitive', 'db/users'), {
  instantPush: true,
});

const sendMail = require('upquire')('/lib/send-mail');


/**
 * Routes
 */
router.get('/:email', function(req, res, next) {
  const user = db.get(`${req.params.email}.json`);

  if (user) {

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

  }

  res.jsend.success({user_exists: user ? true : false});
})


router.get('/:email/:code', function(req, res, next) {
  const user = req.coll.findOne({ 'data.email': req.params.email });

  if (user) {

    if (user.loginCode === req.params.code) {
      user.data.loginCode = req.params.code; // Add`loginCode` to user for pass-back from post-results

      res.jsend.success(user.data)

    }
    else {
      res.jsend.fail({
        message: 'Ugyldig kode',
        code: 422,
      });
    }
  }
  else {
    res.jsend.fail({
      message: 'Kunne ikke finne e-postaddressen',
      code: 422,
    });
  }
});
module.exports = router;