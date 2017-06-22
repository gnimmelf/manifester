const { join } = require('path');
const { inspect } = require('util');

class userService {
  constructor({ db }) {

    console.log(inspect(db, {colors: true, depth: 5}));

    this.users = db;
  }

  getUser(id) {
    return this.users;
  }
}

module.exports = userService;