const debug = require('debug')('services:userService');
const { join } = require('path');
const assert = require('assert');
const { maybeThrow } = require('../../');
const jp = require('jsonpath');

const DBSERVICE = Symbol('dbService');
const USERID = Symbol('userId');
const GROUPS = Symbol('groups');

class UserService {

  constructor({ dbService, userId })
  {
    this[DBSERVICE] = dbService;
    this[USERID] = dbService.users.get(userId) ? userId : undefined;

    debug('userId', this.userId);
    debug('groups', this.groups);

    if (this[USERID]) {
      Object.assign(this, dbService.users.get(join(userId, 'common.json')));
    }
  }

  get userId()
  {
    return this[USERID];
  }

  get groups()
  {
    if (!this[GROUPS]) {
      const tree = this[DBSERVICE].users.get('groups.json');

      this[GROUPS] = jp.nodes(tree, "$[*].members")
        // Filter on `userId` in `members`-array
        .filter(({_, value}) => ~value.indexOf(this[USERID]))
        // Map to the group-name part of the json-`path`
        .map(({path, _}) => path[1]);
    }

    return this[GROUPS];
  }


}

module.exports = UserService;
