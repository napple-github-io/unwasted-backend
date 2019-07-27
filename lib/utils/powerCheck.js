const User = require('../models/User');

function powerCheck() {
  console.log('running power check:');
  return User
    .getPowerUsers()
    .then(users => {
      return Promise.all(users.map(user => {
        return User
          .findByIdAndUpdate(user._id, { powerUser: true }, { new: true });
      }));
    });
}
    
module.exports = powerCheck;
