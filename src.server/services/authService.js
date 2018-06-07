const debug = require('debug')('mf:service:authService');
const { join } = require('path');
const jsonPath = require('jsonpath');
const jwt = require('jsonwebtoken');
const { makeLoginCode, maybeThrow } = require('../lib');

const AUTH_FILE = 'auth.json';

module.exports = ({ dbService, templateService, mailService, hashSecret, siteService }) =>
{
  const userDb = dbService.user;

  const maybeGetAuthPath = (email) =>
  {
    const query = `$[*]['user.json']`
    const node = jsonPath.nodes(userDb.tree, query)
      .find(node => node.value.email == email);

    maybeThrow(!node, 'No user found by given email', 422);

    const userId = node.path[1]

    return join(userId, AUTH_FILE);
  }

  return {

    requestLoginCodeByEmail: (email) =>
    {
      return new Promise((resolve, reject) => {

        const relPath = maybeGetAuthPath(email);

        const loginCode = makeLoginCode();
        const siteSettings = siteService.getSettings();

        userDb.set(relPath, 'loginCode', loginCode);

        templateService['mail-login-code']
          .render({
            ...siteSettings,
            loginCode: loginCode,
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

    exchangeLoginCode2Token: (email, loginCode, renewtoken) =>
    {
      return new Promise((resolve, reject) => {

        const relPath = maybeGetAuthPath(email);

        const authData = userDb.get(relPath);

        maybeThrow(!authData.loginCode, 'No login-code requested', 422);
        maybeThrow(authData.loginCode != loginCode, 'Login-code incorrect', 422);

        userDb.set(relPath, 'loginCode', '');

        // Create new token
        const authToken = jwt.sign({ email : email, salt: makeLoginCode(20) }, hashSecret);
        userDb.set(relPath, 'authToken', authToken);

        resolve(authToken)
      });

    },

    authenticateToken: (token) =>
    {
      return new Promise((resolve, reject) => {

        maybeThrow(!token, 'No token passed', 422);

        const decoded = jwt.verify(token, hashSecret);

        const relPath = maybeGetAuthPath(decoded.email);

        const authData = userDb.get(relPath);

        maybeThrow(!authData, 'Token not found', 404)
        maybeThrow(!authData.authToken, 'No matching token found', 401)
        maybeThrow(authData.authToken != token, 'Token mismatch', 401)
        // TODO! Implement other security measures!
        // https://github.com/auth0/node-jsonwebtoken

        resolve(decoded);
      });
    },

    invalidateToken: (email) =>
    {
      return new Promise((resolve, reject) => {

        const relPath = maybeGetAuthPath(email);

        userDb.delete(relPath, 'authToken');

        resolve("Token invalidated");
      });
    },

  };

};