const { join } = require('path');

// START HERE! This is wrong, the userService is for ONE user, and should be instantiated as that user!
// - Or throw an error if that userId is not found!

class userService {
  constructor({ dbService, userId }) {
    this.user = dbService.users.users.getByPath(id);
  }

  getUser({ id }={}) {
    return this.user;
  }
}

module.exports = userService;