const { Router } = require('express');
const User = require('../models/User');

module.exports = Router()
  .post('/signup', (req, res, next) => {
    console.log(req);
    const {
      username,
      email,
      password, 
      location,
      authId
    } = req.body;

    User
      .create({ username, email, password, location, authId })
      .then(user => {
        res.send({ user });
      })
      .catch(next);
  });
