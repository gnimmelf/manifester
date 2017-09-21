const debug = require('debug')('mf:middleware:authorizeUser');
const intersect = require('intersect');
const normalizeBool = require('normalize-bool');
const makeSingleInvoker = require('../makeSingleInvoker');
const { maybeThrow, requestFullUrl } = require('../');

const authorizeUser = ({groups=[], userIds=[], redirectUrl="/login"}) =>
{

  return makeSingleInvoker(({ userService }) => {

    return (req, res, next) =>
    {
      const user = userService.currentUser;
      const authorized = normalizeBool(user && (intersect(user.groups, groups).length || ~userIds.indexOf(user.userId)));

      debug('authorized', authorized, groups, userIds)

      if (!authorized) {

        if(redirectUrl) {
          res.redirect(`${redirectUrl}?origin=${req.originalUrl}`);
        }
        else {
          maybeThrow(!authorized, 'Access denied', 401);
        }

        return;
      }

      next();
    };

  });

};


module.exports = authorizeUser;