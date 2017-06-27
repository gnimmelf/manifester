/**
 * Authentication (jwt) and authorization (db.users/groups.json)
 */
const jwt = require('jsonwebtoken');
const { makeLogincode } = require('../utils');

module.exports = ({ dbService, mailService, hashSecret }) => {

  const requestLogincodeByMail = (email) => {
    const user = dbService.users.getByPath(email);

  };


  const authenticateLogincode = (email, logincode) => {
    const user = dbService.users.getByPath(email);
  };


  const authenticateToken = (token) => {

    return new Promise((resolve, reject) => {

      // Verify secret and check if expired
      jwt.verify(token, hashSecret, function(err, decoded) {
        err ? reject(err) : resolve(decoded);
      });

    });
  };

  /**
   * Public
   */
  return {

    authenticate: authenticate
  }

}