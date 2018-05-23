const debug = require('debug')('mf:services:userService');
const { join } = require('path');
const assert = require('assert');
const jp = require('jsonpath');
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


  return {
    currentUser: getUserBy('email', currentUserEmail),
    getUserBy: getUserBy,
    listUsers: () => {
      // TODO!
      return []
    }
  }

};
