const debug = require('debug')('mf:services:userService');
const { join } = require('path');
const assert = require('assert');
const jsonPath = require('jsonpath');
const intersect = require('intersect');
const { maybeThrow, addFileExt } = require('../../lib');

// Symbols
const USERID = Symbol('userId');
const GROUPS = Symbol('groups');

const OPERATIONS = ['create', 'read', 'update', 'delete'];

const validateOperation = (operation) => assert(~OPERATIONS.indexOf(operation), `Invalid operation: ${operation}`);
const validatePermissions = (permissions) => permissions.forEach(permission => {
  // TODO! Not necessary?
  assert(~OPERATIONS.concat('*').indexOf(permission), `Invalid operation: ${permission}`);
});

module.exports = ({ dbService, currentUserEmail }) => {

  const userDb = dbService.users;

  class User {

    constructor(userId)
    {
      this[USERID] = userId;
      Object.assign(this, userDb.get(join(userId, 'user.json')));
    }

    get userId()
    {
      return this[USERID];
    }

    get groups()
    {
      if (!this[GROUPS]) {
        const tree = userDb.get('groups.json');

        const groups = jsonPath.nodes(tree, "$[*].members")
          // Filter on `userId` in `members`-array
          .filter(({_, value}) => ~value.indexOf(this[USERID]))
          // Map to the group-name part of the json-`path`
          .map(({path, _}) => path[1]);

        // Set groups, automatically add `user`-group
        this[GROUPS] = groups.concat('user')
      }

      return this[GROUPS];
    }
  }

  const getUserBy = (key, value) =>
  {
    let user;

    assert(key, 'No key passed!')

    debug('getUserBy', key, value);

    if (value) {
      const node = jsonPath.nodes(userDb.tree, "$[*]['user.json']")
        .find(node => node.value[key] == value);

      // The `userId` is the second element of the `node.path`
      if (node) user = new User(node.path[1])
    }

    return user;
  }

  const authorizeByACL = (ACL, operation, owner=null) =>
  {
    validateOperation(operation);

    debug('authorizeByACL', {
      ACL: ACL,
      currentUser: currentUser,
      groups: currentUser ? currentUser.groups : [],
    })

    const userGroups = currentUser ? currentUser.groups : [];
    const isAdmin = !!~userGroups.indexOf('admins');
    const isOwner = (owner && currentUser ? currentUser.userId == owner.userId : false);

    const authorizedBy = [];

    if (isAdmin) authorizedBy.push('isAdmin');
    if (isOwner) authorizedBy.push('isOwner');

    if (!authorizedBy.length && ACL)
    {
      const matchGroup = Object.entries(ACL).find(([group, permissions]) =>
      {
        validatePermissions(permissions);
        // For each ACL entry, ACL-`group` must be in `userGroups` AND ACL-`permissions` must be "*" for all, or include `operation`:
        const match = (group == '*' || (!!~userGroups.indexOf(group))) && intersect(permissions, ['*', operation]).length;
        return match ? group : false;
      })

      if (matchGroup) authorizedBy.push(matchGroup);
    }

    debug(operation.toUpperCase()+': '+(authorizedBy.length ? 'authorized' : 'unauthorized'), authorizedBy, currentUser ? currentUser : '<not logged in>')

    maybeThrow(!authorizedBy.length, currentUser ? 'Unauthorized' : 'Not logged in', 401)

    return currentUser;
  };

  /*
    Set values for the service
  */
  const currentUser = currentUserEmail ? getUserBy('email', currentUserEmail) : undefined;

  const users = [/* TODO! */];

  return {
    getUserBy: getUserBy,
    authorizeByACL: authorizeByACL,
    currentUser: currentUser,
    users: users,
  }

};
