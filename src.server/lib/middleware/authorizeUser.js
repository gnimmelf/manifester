const debug = require('debug')('middleware:authorizeUser');
const intersect = require('intersect');
const normalizeBool = require('normalize-bool');
const makeSingleInvoker = require('../makeSingleInvoker');
const { maybeThrow } = require('../');

const authorizeUser = ({groups=[], userIds=[]}) =>
{

  return makeSingleInvoker(({ userService }) => {

    return (req, res, next) =>
    {
      const authorized = normalizeBool(intersect(userService.groups, groups).length || ~userIds.indexOf(userService.userId));

      debug('authorized', authorized, groups, userIds)

      maybeThrow(!authorized, 'Access denied', 401);

      next();
    };

  });

};


module.exports = authorizeUser;