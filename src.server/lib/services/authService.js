const debug = require('debug')('mf:service:authService');
const { join } = require('path');
const jwt = require('jsonwebtoken');
const { makeLogincode, maybeThrow } = require('../');

const AUTH_FILE = 'auth.json';

module.exports = ({ dbService, templateService, mailService, hashSecret, siteService }) => {

  const userDb = dbService.users;

  const maybeGetUser = (email) => {
    const user = userDb.get(email);
    maybeThrow(!user, 'User not found by given email', 422);
    return user['common.json'];
  }

  return {

    requestLogincodeByEmail: (email) => {

      return new Promise((resolve, reject) => {

        maybeGetUser(email);

        const logincode = makeLogincode();
        const siteSettings = siteService.settings;

        userDb.set(join(email, AUTH_FILE), 'logincode', logincode);

        templateService['mail-logincode']
          .render({
            logincode: logincode,
            domainName: siteSettings.siteName
          })
          .then(html => {

            console.log("requestLogincodeByEmail\n", html)

            // mailService.sendMail({
            //   senderName: siteSettings.siteName,
            //   recieverEmail: email,
            //   subjectStr: 'Your requesd logincode',
            //   textOrHtml: html,
            // });

            resolve(logincode)
          })
          .catch(err => reject(err))

      });

    },


    exchangeLogincode2Token: (email, logincode, renewtoken) => {

      return new Promise((resolve, reject) => {

        maybeGetUser(email);

        const authData = userDb.get(join(email, AUTH_FILE));

        maybeThrow(!authData.logincode, 'No logincode requested', 422);
        maybeThrow(authData.logincode != logincode, 'Logincode incorrect', 422);

        userDb.set(join(email, AUTH_FILE), 'logincode', '');

        let authToken;

        // Create new token
        authToken = jwt.sign({ email : email, salt: makeLogincode(20) }, hashSecret);
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