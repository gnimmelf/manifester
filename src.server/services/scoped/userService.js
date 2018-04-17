const debug = require('debug')('mf:services:userService');
const { join } = require('path');
const assert = require('assert');
const { maybeThrow } = require('../../lib');
const jp = require('jsonpath');

// Symbols
const USERID = Symbol('userId');
const GROUPS = Symbol('groups');

module.exports = ({ dbService, userId }) => {

  const userDb = dbService.users;

  class User {

    constructor(userId)
    {
      this[USERID] = userId;
      Object.assign(this, userDb.get(join(userId, 'common.json')));
    }

    get userId()
    {
      return this[USERID];
    }

    get groups()
    {
      if (!this[GROUPS]) {
        const tree = userDb.get('groups.json');

        this[GROUPS] = jp.nodes(tree, "$[*].members")
          // Filter on `userId` in `members`-array
          .filter(({_, value}) => ~value.indexOf(this[USERID]))
          // Map to the group-name part of the json-`path`
          .map(({path, _}) => path[1]);
      }

      return this[GROUPS];
    }

  }

  return {
    currentUser: userId && userDb.get(userId) ? new User(userId) : undefined,
    users: userDb.get()
  }

};
