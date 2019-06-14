const { Router } = require('express');
const User = require('../models/User');

module.exports = Router()
  .post('/signup', (req, res, next) => {
    const {
      username,
      email,
      password, 
      location,
      authId,
      firstName,
      lastName
    } = req.body;

    User
      .create({ username, email, password, location, authId, firstName, lastName })
      .then(user => {
        res.send({ user });
      })
      .catch(next);
  })

  .get('/getMongooseId', (req, res, next) => {
    User
      .findOne({ username: req.query.username })
      .then(foundUser => {
        res.send(foundUser);
      })
      .catch(next);
  });
