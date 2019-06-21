const { Router } = require('express');
const User = require('../models/User');
const Review = require('../models/Review');
const ensureAuth = require('../middleware/ensure-auth');

module.exports = Router()
  .post('/', ensureAuth(), (req, res, next) => {
    const {
      reviewer,
      reviewee,
      thumbsUp,
      reviewText
    } = req.body;

    Review
      .create({ reviewer, reviewee, thumbsUp, reviewText })
      .then(review => {
        res.send(review);
      })
      .catch(next);
  })

  .get('/', (req, res, next) => {
    Review
      .find({ reviewee: req.query.id })
      .populate({ path:'reviewer', select:'userImage username' })
      .select({
        __v: false
      })
      .lean()
      .then(reviews => res.send(reviews))
      .catch(next);
  });
