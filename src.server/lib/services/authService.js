const debug = require('debug')('service:authService');
const jwt = require('jsonwebtoken');
const { makeLogincode } = require('../makeLogincode');

module.exports = ({ dbService, mailService, hashSecret }) => {

  const requestLogincodeByMail = (email) => {

    return new Promise((resolve, reject) => {
      const user = dbService.users.getByPath(email);
      const logincode = makeLogincode();
      debug(user, logincode)
      resolve(logincode)
    });

  };


  const authenticateLogincode = (email, logincode) => {

    return new Promise((resolve, reject) => {
      const user = dbService.users.getByPath(email);
    });

  };


  const authenticateToken = (token) => {

    return new Promise((resolve, reject) => {

      reject('No token to decode!');

      // Verify secret and check if expired
      jwt.verify(token, hashSecret, (err, decoded) => {
        if (err) {
          err.message = 'no token found';
          debug('failed decoding', `${err.name}`, err.message);
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
    requestLogincodeByMail: requestLogincodeByMail,
    authenticateLogincode: authenticateLogincode,
    authenticateToken: authenticateToken,
  }

}