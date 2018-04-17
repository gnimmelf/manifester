const debug = require('debug')('mf:service:authService');
const { join } = require('path');
const jwt = require('jsonwebtoken');
const { makeLoginCode, maybeThrow } = require('../lib');

const AUTH_FILE = 'auth.json';

module.exports = ({ dbService, templateService, mailService, hashSecret, siteService }) => {

  const userDb = dbService.users;

  const maybeGetUser = (email) => {
    const user = userDb.get(email);
    maybeThrow(!user, 'User not found by given email', 422);
    return user['common.json'];
  }

  return {

    requestLoginCodeByEmail: (email) => {

      return new Promise((resolve, reject) => {

        maybeGetUser(email);

        const loginCode = makeLoginCode();
        const siteSettings = siteService.settings;

        userDb.set(join(email, AUTH_FILE), 'loginCode', loginCode);

        templateService['mail-login-code']
          .render({
            loginCode: loginCode,
            domainName: siteSettings.siteName
          })
          .then(html => {

            console.log("requestLoginCodeByEmail\n", html)

            // mailService.sendMail({
            //   senderName: siteSettings.siteName,
            //   recieverEmail: email,
            //   subjectStr: 'Your requested loginCode',
            //   textOrHtml: html,
            // });

            resolve(loginCode)
          })
          .catch(err => reject(err))

      });

    },


    exchangeLoginCode2Token: (email, loginCode, renewtoken) => {

      return new Promise((resolve, reject) => {

        maybeGetUser(email);

        const authData = userDb.get(join(email, AUTH_FILE));

        maybeThrow(!authData.loginCode, 'No login-code requested', 422);
        maybeThrow(authData.loginCode != loginCode, 'Login-code incorrect', 422);

        userDb.set(join(email, AUTH_FILE), 'loginCode', '');

        let authToken;

        // Create new token
        authToken = jwt.sign({ email : email, salt: makeLoginCode(20) }, hashSecret);
        userDb.set(join(email, AUTH_FILE), 'authToken', authToken);

        resolve(authToken)
      });

    },

    authenticateToken: (token) => {

      return new Promise((resolve, reject) => {

        maybeThrow(!token, 'No token passed', 422);

        const decoded = jwt.verify(token, hashSecret);
        const authData = userDb.get(join(decoded.email, AUTH_FILE));

        maybeThrow(!authData, 'Token userId not found', 404)
        maybeThrow(!authData.authToken, 'No matching token found', 401)
        maybeThrow(authData.authToken != token, 'Token mismatch', 401)
        // TODO! Implement other security measures!
        // https://github.com/auth0/node-jsonwebtoken

        resolve(decoded);
      });
    },

  };

};