const { Router } = require('express');
const Listing = require('../models/Listing');

module.exports = Router()
  .post('/', (req, res, next) => {
    const {
      title,
      user,
      imageUrl,
      description,
      location,
      category,
      dietary,
      postedDate,
      expiration,
      archived
    } = req.body;

    Listing
      .create({ title, user, imageUrl, description, location, category, dietary, postedDate, expiration, archived })
      .then(listing => {
        res.send(listing);
      })
      .catch(next);
  })

  .get('/', (req, res, next) => {
    Listing
      .find()
      .select({ __v: false })
      .lean()
      .then(allListings => res.send(allListings))
      .catch(next);
  });
