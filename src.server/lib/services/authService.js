const debug = require('debug')('service:authService');
const { join } = require('path');
const jwt = require('jsonwebtoken');
const { makeLogincode, maybeThrow } = require('../');

const AUTH_FILE = 'auth.json';

module.exports = ({ dbService, templateService, mailService, hashSecret }) => {

  const maybeGetUser = (email) => {
    const user = dbService.users.get(email);
    maybeThrow(!user, 'User not found by given email', 422);
    return user['common.json'];
  }

  return {

    requestLogincodeByEmail: (email) => {

      return new Promise((resolve, reject) => {

        maybeGetUser(email);

        const logincode = makeLogincode();

        dbService.users.set(join(email, AUTH_FILE), 'logincode', logincode);

        templateService['mail-logincode']
          .hook(ctx => Object.assign(ctx, {logincode: 'HOOKED'}))
          .render({
            logincode: logincode,
            domainName: "siteName"
          })
          .then(html => {

            console.log("requestLogincodeByEmail\n", html)

            // mailService.sendMail({
            //   senderName: siteService.siteName,
            //   recieverEmail: email,
            //   subjectStr: 'Your requesd logincode',
            //   textOrHtml: html,
            // })
            resolve(logincode)
          })
          .catch(err => reject(err))

      });

    },


    authenticateLogincode: (email, logincode, renewtoken) => {

      return new Promise((resolve, reject) => {

        maybeGetUser(email);

        const authData = dbService.users.get(join(email, AUTH_FILE));

        maybeThrow(!authData.logincode, 'No logincode requested', 422);
        maybeThrow(authData.logincode != logincode, 'Logincode incorrect', 422);

        dbService.users.set(join(email, AUTH_FILE), 'logincode', '');

        let authtoken;

        if (authData.authtoken && !renewtoken) {
          // Reuse token
          authtoken = authData.authtoken;
        }
        else {
          // Create new token
          authtoken = jwt.sign({ email : email }, hashSecret);
          dbService.users.set(join(email, AUTH_FILE), 'authtoken', authtoken);
        }

        resolve(authtoken)
      });

    },


    authenticateToken: (token) => {

      return new Promise((resolve, reject) => {

        maybeThrow(!token, 'No token passed', 422);

        jwt.verify(token, hashSecret, (err, decoded) => {
          maybeThrow(err);
          resolve(decoded);
        });

      });
    },

  };

};