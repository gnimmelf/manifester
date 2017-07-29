const debug = require('debug')('service:authService');
const { join } = require('path');
const jwt = require('jsonwebtoken');
const { makeLogincode, maybeThrow } = require('../');

module.exports = ({ dbService, mailService, hashSecret }) => {

  const getUser = (email) => {
    const user = dbService.users.get(email);
    maybeThrow(!user, 'User not found by given email', 422);
    return user['common.json'];
  }


  const requestLogincodeByEmail = (email) => {

    return new Promise((resolve, reject) => {

      getUser(email);

      const logincode = makeLogincode();

      dbService.users.set(join(email, 'logincode.json'), {logincode: logincode});


      // TODO!
      //mailService.sendMail()

      resolve(logincode)
    });

  };


  const authenticateLogincode = (email, logincode) => {

    return new Promise((resolve, reject) => {

      const user = getUser(email);

      const storedLogincode = dbService.users.get(join(email, 'logincode.json', 'logincode'));

      maybeThrow(!storedLogincode, 'No logincode requested', 422);

      maybeThrow(storedLogincode != logincode, 'Logincode incorrect', 422);

      var token = jwt.sign(user, hashSecret, {
        expiresIn: '24h'
      });

      dbService.users.delete(join(email, 'logincode.json'), 'logincode');

      resolve(token)
    });

  };


  const authenticateToken = (token) => {

    return new Promise((resolve, reject) => {

      reject('No token to decode!');

      // Verify secret and check if expired
      jwt.verify(token, hashSecret, (err, decoded) => {
        if (err) {

          // TODO! + Restfull status codes!

          reject(err);
        }
        else {
          debug('decoded', decoded);
          resolve(decoded);
        }
      });

    });
  };

  /**
   * Public
   */
  return {
    requestLogincodeByEmail: requestLogincodeByEmail,
    authenticateLogincode: authenticateLogincode,
    authenticateToken: authenticateToken,
  }

}