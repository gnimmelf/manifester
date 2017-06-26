const { join } = require('path');
const { inspect } = require('util');

class userService {
  constructor({ db }) {
    this.users = db.users;
  }

  getUser(id) {
    return this.users.get(id);
  }
}

module.exports = userService;