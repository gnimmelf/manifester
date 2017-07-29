const { join } = require('path');
const assert = require('assert');
const { maybeThrow } = require('../../');


class UserService {

  constructor({ dbService, userId })
  {
    this.dbService = dbService;
    this.userId = userId;
    this.user = dbService.users.get(userId);
  }


}

module.exports = UserService;