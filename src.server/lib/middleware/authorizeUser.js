const debug = require('debug')('middleware:authorizeUser');
const intersect = require('intersect');
const normalizeBool = require('normalize-bool');
const makeSingleInvoker = require('../makeSingleInvoker');
const { maybeThrow, requestFullUrl } = require('../');

const authorizeUser = ({groups=[], userIds=[], redirectUrl}) =>
{

  return makeSingleInvoker(({ userService }) => {

    return (req, res, next) =>
    {
      const authorized = normalizeBool(intersect(userService.groups, groups).length || ~userIds.indexOf(userService.userId));

      debug('authorized', authorized, groups, userIds)

      if (redirectUrl) {
        // TODO! Check if there is an http-header to use for `origin`
        res.redirect(`${redirectUrl}?origin=${requestFullUrl(req)}`);
      }

      maybeThrow(!authorized, 'Access denied', 401);

      next();
    };

  });

};


module.exports = authorizeUser;