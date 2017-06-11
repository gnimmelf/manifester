const jwt = require('jsonwebtoken');
const upquire = require('upquire');

// Sensitive stuff
const hashSecret = upquire('/sensitive/hash-secret');

module.exports = function(req, res, next)
/**
JWT authorize middleware
*/
{
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, hashSecret, function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.jsend.fail({
        message: 'No token provided',
        code: 403,
    });

  }
}