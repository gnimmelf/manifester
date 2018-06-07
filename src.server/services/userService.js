const debug = require('debug')('mf:service:userService');
const { join } = require('path');
const assert = require('assert');
const jsonPath = require('jsonpath');
const intersect = require('intersect');
const { maybeThrow, addFileExt } = require('../lib');

// Symbols
const USERID = Symbol('userId');
const GROUPS = Symbol('groups');


// TODO! These validations should be part of the schema-definitions?
const OPERATIONS = ['create', 'read', 'update', 'delete'];
const validateOperation = (operation) => assert(~OPERATIONS.indexOf(operation), `Invalid operation: ${operation}`);
const validatePermissions = (permissions) => permissions.forEach(permission => {
  assert(~OPERATIONS.concat('*').indexOf(permission), `Invalid operation: ${permission}`);
});

module.exports = ({ dbService }) => {

  const userDb = dbService.user;

  // Scoped variables
  let currentUser, userList, groupList;

  class User
  {
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
  };

  const getUserBy = (key, value) =>
  {
    let user;

    assert(key, 'No key passed!')


    if (value) {
      const node = jsonPath.nodes(userDb.tree, "$[*]['user.json']")
        .find(node => node.value[key] == value);

      // The `userId` is the second element of the `node.path`
      if (node) user = new User(node.path[1])
    }

    debug('getUserBy', key, value, '=>', user.email);

    return user;
  }

  const getUserList = () =>
  {
    if (userList == undefined) {
      const userList = jsonPath.nodes(userDb.tree, "$[*]['user.json']")
        .map(node => node.path[1]);
    }
    return userList;
  }

  const getGroupList = () =>
  {
    if (groupList == undefined) {
      groupList = jsonPath.nodes(userDb.get('groups.json'), "$[*].name")
        .map(({path, value}) => ({key: path[1], name: value}));
    }
    return groupList;
  }

  const authorizeByACLg = (ACLg, operation, {owner=null, supressError=false}={}) =>
  // TODO! Check lowest `user.groups[x].accessLevel` vs. highest `allowedGroups[x].accessLevel` for the current `operation`
  {
    validateOperation(operation);

    const userGroups = currentUser ? currentUser.groups : [];
    const isAdmin = !!~userGroups.indexOf('admins');
    const isOwner = (owner && currentUser ? currentUser.userId == owner.userId : false);

    const authorizedBy = [];

    if (isAdmin) authorizedBy.push('isAdmin');
    if (isOwner) authorizedBy.push('isOwner');

    if (!authorizedBy.length && ACLg)
    {
      const matchGroup = Object.entries(ACLg).find(([group, permissions]) =>
      {
        validatePermissions(permissions);
        // For each ACLg entry, ACLg-`group` must be in `userGroups` AND ACLg-`permissions` must be "*" for all, or include `operation`:
        const match = (group == '*' || (!!~userGroups.indexOf(group))) && intersect(permissions, ['*', operation]).length;
        return match ? group : false;
      })

      if (matchGroup) authorizedBy.push(matchGroup);
    }

    debug('authorizeByACLg', operation.toUpperCase(), {
      user: (currentUser ? `${currentUser.email} [${currentUser.groups}]` : '<Not logged in>'),
      authorizedBy: authorizedBy.length ? authorizedBy : 'Unauthorized!',
      ACLg: ACLg,
    });

    if (!supressError) {
      maybeThrow(!authorizedBy.length, currentUser ? 'Unauthorized' : 'Not logged in', 401)
    }

    return currentUser;
  };

  return {
    // Functions
    setCurrentUserBy: (key, value) => {
      debug('setCurrentUserBy', key, value, `(was '${currentUser && currentUser.email})'`);
      currentUser = getUserBy(key, value);
    },
    getUserBy: getUserBy,
    authorizeByACLg: authorizeByACLg,
    // Getters
    get currentUser() { return currentUser },
    get users() { return getUserList() },
    get groups() { return getGroupList() },
  }

};
