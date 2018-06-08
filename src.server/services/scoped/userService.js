const debug = require('debug')('mf:service:userService');
const { join } = require('path');
const assert = require('assert');
const jsonPath = require('jsonpath');
const {
  maybeThrow,
  addFileExt
} = require('../../lib');

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
  let currentUser, userList;

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
        const groups = userDb.get(join(this[USERID], 'auth.json'), 'groups');

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
      userList = jsonPath.nodes(userDb.tree, "$[*]['user.json']")
        .map(node => ({
          handle: node.path[1],
          name: `${node.value.firstName} ${node.value.lastName}`,
        }));
    }
    return userList;
  }

  return {
    // Functions
    setCurrentUserBy: (key, value) => {
      debug('setCurrentUserBy', key, value, `(was '${currentUser && currentUser.email})'`);
      currentUser = getUserBy(key, value);
    },
    getUserBy: getUserBy,
    // Getters
    get currentUser() { return currentUser },
    get users() { return getUserList() },
  }

};
