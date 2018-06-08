const debug = require('debug')('mf:middleware:authorizeUser');
const intersect = require('intersect');
const normalizeBool = require('normalize-bool');
const { maybeThrow, requestFullUrl, makeSingleInvoker } = require('../lib');

const authorizeRequest = (allowedGroups, redirectUrl='') =>
// TODO! Check `min(user.groups[x].accessLevel)` <= `max(allowedGroups[x].accessLevel)`
// TODO! Transfer `accessLevel`-logic to `userService.authorizeByACLg()`
{

  return makeSingleInvoker(({ userService }) => {

    return (req, res, next) =>
    {
      if (allowedGroups.length) {

        const user = userService.currentUser;

        const authorized = !!(user && intersect(user.groups, allowedGroups).length);

        if (!authorized && redirectUrl) {
          res.redirect(`${redirectUrl}?origin=${req.originalUrl}`);
          return;
        }

        maybeThrow(!authorized, user ? 'Unauthorized' : 'Not logged in', 401);
      }

      next();
    };



  });

};


module.exports = authorizeRequest;