const Review = require('../models/Review');
const User = require('../models/User');

function ratingCheck() {
  return Review
    .getRating()
    .then(usersArr => {
      usersArr.forEach(user =>{
        let myCounter = 0;
        let newUser = '';
        user.reviews.forEach(val => val ? myCounter++ : val);
        if(user.totalCount < 5) {
          newUser = 'New User: ';
        }
        if(myCounter / user.totalCount >= 0.7){
          return User
            .findByIdAndUpdate(user.reviewee, { standing: newUser + 'Trusted' }, { new: true });
        } else { 
          return User
            .findByIdAndUpdate(user.reviewee, { standing: newUser + 'In Poor Standing' }, { new: true });
        }
      });
    });
}

module.exports = ratingCheck;
