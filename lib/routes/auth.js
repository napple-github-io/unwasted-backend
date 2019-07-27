const { Router } = require('express');
const User = require('../models/User');
const ensureAuth = require('../middleware/ensure-auth');

module.exports = Router()
  .post('/signup', (req, res, next) => {
    const {
      username,
      email,
      password, 
      location,
      authId,
      firstName,
      lastName,
      bio,
      userImage
    } = req.body;

    User
      .create({ username, email, password, location, authId, firstName, lastName, bio, userImage })
      .then(user => res.send(user))
      .catch(next);
  })

  .get('/getMongooseId', (req, res, next) => {
    User
      .findOne({ username: req.query.username })
      .then(foundUser => {
        res.send(foundUser);
      })
      .catch(next);
  })

  .get('/power', (req, res, next) => {
    console.log('hit power route');
    User
      .find({ powerUser: true })
      .then(powerUserList => {
        res.send(powerUserList);
      })
      .catch(next);
  })
  
  .get('/users/:id', (req, res, next) => {
    User
      .findById(req.params.id)
      .select({
        __v: false
      })
      .lean()
      .then(foundUser => res.send(foundUser))
      .catch(next);
  })

  .patch('/users/:id', ensureAuth(), (req, res, next) => {
    const { location, userImage } = req.body;

    User
      .findById(req.params.id)
      .then(foundUser => {
        if(req.user.name === foundUser.username) {
          if(location && !userImage) User.findByIdAndUpdate(foundUser._id, { location }, { new: true });
          if(userImage && !location) User.findByIdAndUpdate(foundUser._id, { userImage }, { new: true });
          if(userImage && location) User.findByIdAndUpdate(foundUser._id, { userImage, location }, { new: true });
        }
      })
      .select({
        __v: false
      })
      .lean()
      .then(updatedUser => res.send(updatedUser))
      .catch(next);
  });

