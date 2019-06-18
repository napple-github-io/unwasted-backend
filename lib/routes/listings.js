const { Router } = require('express');
const Listing = require('../models/Listing');
const sgMail = require('@sendgrid/mail');
const ensureAuth = require('../middleware/ensure-auth');

module.exports = Router()
  .post('/new', ensureAuth(), (req, res, next) => {
    const {
      title,
      user,
      imageUrl,
      description,
      category,
      dietary,
      postedDate,
      expiration,
      archived,
      location
    } = req.body;
    console.log(title);
    Listing
      .create({ title, user, imageUrl, description, location, category, dietary, postedDate, expiration, archived })
      .then(listing => {
        res.send(listing);
      })
      .catch(next);
  })

  .get('/', (req, res, next) => {
    console.log('hit /');
    Listing
      .find()
      .populate({ path: 'user', select: 'username' })
      .select({ __v: false })
      .lean()
      .then(allListings => res.send(allListings))
      .catch(next);
  })

  .get('/user', (req, res, next) => {
    console.log('hit me');
    console.log(req.query.id);
    Listing
      .find({ user: req.query.id })
      .select({ __v: false })
      .lean()
      .then(listing => res.send(listing))
      .catch(next);
  })

  .get('/:listingId', (req, res, next) => {
    console.log('hit by id')

    Listing
      .findById(req.params.listingId)
      .populate('user')
      .select({ __v: false })
      .lean()
      .then(listing => res.send(listing))
      .catch(next);
  })

  

  .post('/email', (req, res, next) => {
    console.log(req.body);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sgMail.send(req.body)
      .then(emailRes => res.send(emailRes))
      .catch(next);
  });
