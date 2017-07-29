const { join } = require('path');
const assert = require('assert');
const { makeLogincode, maybeThrow } = require('../../');


class UserService {
  constructor({ dbService, userId })
  {
    this.dbService = dbService;
    this.userId = userId;
    this.user = dbService.users.get(userId);

  }


  makeLogincode()
  {
    assert(this.user);
    const logincode = makeLogincode();
    this.dbService.users.set(join(this.userId, 'logincode.json'), {logincode: logincode});
    return logincode;
  }

}

module.exports = UserService;