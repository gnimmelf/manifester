const jwt = require('jsonwebtoken');
const upquire = require('upquire');

/*
  JWT authorize middleware
*/
module.exports = function(req, res, next)
{
  const hash_secret = req.container.get('sensitive').hashSecret;

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, hashSecret, function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        req.container.set('');
        next();
      }
    });

  }
}