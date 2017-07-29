const debug = require('debug')('service:authService');
const jwt = require('jsonwebtoken');
const { makeLogincode, maybeThrow } = require('../');
const UserService = require('./scoped/userService');

module.exports = ({ dbService, mailService, hashSecret }) => {

  const requestLogincodeByEmail = (email) => {

    return new Promise((resolve, reject) => {
      const userService = new UserService({dbService: dbService, userId: email});

      maybeThrow(!userService.user, 'user not found by given email', 422);

      const logincode = userService.makeLogincode();

      // TODO!
      //mailService.sendMail()

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