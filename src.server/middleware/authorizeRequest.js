const debug = require('debug')('mf:middleware:authorizeUser');
const intersect = require('intersect');
const normalizeBool = require('normalize-bool');
const { maybeThrow, requestFullUrl, makeSingleInvoker } = require('../lib');

const authorizeRequest = (ACLg, redirectUrl='') =>
{

  return makeSingleInvoker(({ userService }) => {

    return (req, res, next) =>
    {
      const user = userService.currentUser;

      const operation = ~['POST', 'PUT', 'DELETE'].indexOf(req.method.toUpperCase()) ? 'write' : 'read';

      try {
        userService.authorizeByACLg(ACLg, operation)
      }
      catch(err) {
        if(redirectUrl) {
          res.redirect(`${redirectUrl}?origin=${req.originalUrl}`);
        }
        else {
          throw(err);
        }
      }

      next();
    };

  });

};


module.exports = authorizeRequest;