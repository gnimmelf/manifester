const debug = require('debug')('mf:services:userService');
const { join } = require('path');
const assert = require('assert');
const jp = require('jsonpath');
const intersect = require('intersect');
const { maybeThrow, addFileExt } = require('../../lib');

// Symbols
const USERID = Symbol('userId');
const GROUPS = Symbol('groups');

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

        const groups = jp.nodes(tree, "$[*].members")
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
      const node = jp.nodes(userDb.tree, "$[*]['user.json']")
        .find(node => node.value[key] == value);

      // The `userId` is the second element of the `node.path`
      if (node) user = new User(node.path[1])
    }

    return user;
  }

  const authorizeByACL = (ACL, operation, owner=null) =>
  {
    assert(~['read', 'write'].indexOf(operation), `Invalid operation: ${operation}`);

    const userGroups = currentUser ? currentUser.groups : [];
    const isAdmin = !!~userGroups.indexOf('admin');
    const isOwner = (owner && currentUser ? currentUser.userId == owner.userId : false);

    const authorizedBy = [];

    if (isAdmin) authorizedBy.push('admin');
    if (isOwner) authorizedBy.push('owner');

    if (!authorizedBy.length && ACL)
    {
      const matchGroup = Object.entries(ACL).find(([group, permissions]) =>
      {
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
