const debug = require('debug')('service:authService');
const jwt = require('jsonwebtoken');
const { makeLogincode, maybeThrow } = require('../');

module.exports = ({ dbService, mailService, hashSecret }) => {

  const requestLogincodeByEmail = (email) => {

    return new Promise((resolve, reject) => {
      const user = dbService.users.getByPath(email);

      maybeThrow(!user, 'invalid email-address; user not found', 422);

      const logincode = makeLogincode();

      // TODO! START HERE. Make db create file if it doesn't exist already
      user.setByPath('logincode.json', {})

      // TODO!
      mailService.sendMail()

      resolve(logincode)
    });

  };


  const authenticateLogincode = (email, logincode) => {

    return new Promise((resolve, reject) => {
      const user = dbService.users.getByPath(email);

      // TODO! + Restfull status codes!

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