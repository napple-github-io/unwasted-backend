const { Router } = require('express');
const Review = require('../models/Review');
const ensureAuth = require('../middleware/ensure-auth');

module.exports = Router()
  .post('/', (req, res, next) => {
    console.log(req.body);
    const {
      reviewer,
      reviewee,
      thumbsUp,
      reviewText
    } = req.body;

    Review
      .create({ reviewer, reviewee, thumbsUp, reviewText })
      .then(review => {
        console.log(review);
        res.send(review)
          .catch(next);
      });
  });
