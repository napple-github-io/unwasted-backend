const { Router } = require('express');
const Listing = require('../models/Listing');
const User = require('../models/User');
const sgMail = require('@sendgrid/mail');
const ensureAuth = require('../middleware/ensure-auth');
const parseBoolean = require('../utils/parseBoolean');
const { getDistance } = require('../utils/distanceCalc');

module.exports = Router()
  .post('/', ensureAuth(), (req, res, next) => {
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
    } = req.body;

    const location = {
      street: req.body.location.street.replace('#', ''),
      state: req.body.location.state,
      zip: req.body.location.zip
    };

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
      .populate({ path: 'user', select: 'username' })
      .select({ __v: false })
      .lean()
      .then(allListings => res.send(allListings))
      .catch(next);
  })

  .get('/user', (req, res, next) => {
    Listing
      .find({ user: req.query.id })
      .select({ __v: false })
      .lean()
      .then(listing => res.send(listing))
      .catch(next);
  })

  .get('/distance', (req, res, next) => {
    // console.log('trying');
    const origin = req.query;
    // console.log(origin);
    Listing
      .find()
      .populate({ path: 'user', select: 'username' })
      .select({ __v: false })
      .lean()
      .then(listings => {
        // console.log(listings);
        return Promise.all(listings.map(listing => {
          return getDistance(origin, listing.location.street);
        })).then(distances => {
          return distances.map((distance, i) => {
            return { ...listings[i], _id: listings[i]._id, distance };
          });
        })
          .then(arrayOfDetailedListings => {
            console.log(arrayOfDetailedListings);
            res.send(arrayOfDetailedListings);
          });
      })
      .catch(next);
  })

  .get('/search', (req, res, next) => {
    const parsedForDietary = parseBoolean(req.query);
    let searchObj = {};

    if(req.query.category) searchObj.category = req.query.category;
    
    Listing
      .find({ ...searchObj, ...parsedForDietary })
      .select()
      .lean()
      .then(listings => {
        res.send(listings);
      })
      .catch(next);
  })

  .get('/:listingId', (req, res, next) => {
    //CHANGE THE POPULATE TO NOT INCLUDE EMAIL/ADDRESS
    Listing
      .findById(req.params.listingId)
      .populate({ path:'user', select:'username' })
      .select({ __v: false })
      .lean()
      .then(listing => res.send(listing))
      .catch(next);
  })

  

  .post('/email', ensureAuth(), (req, res, next) => {
    User
      .findById(req.body.from)
      .then(foundFrom => {
        if(foundFrom.username === req.user.name){
          Promise.all(([
            Promise.resolve(foundFrom),
            User.findById(req.body.to)
          ]))
            .then(([foundFrom, foundTo]) => {
              req.body.from = foundFrom.email;
              req.body.to = foundTo.email;
            })
            .then(() => {
              sgMail.setApiKey(process.env.SENDGRID_API_KEY);
              sgMail.send(req.body)
                .then(emailRes => res.send(emailRes))
                .catch(next);
            });
        } else {
          const error = new Error('Unauthorized to send');
          error.status = 480;
          return next(error);
        }
      });
  })

  .patch('/:listingId', ensureAuth(), (req, res, next) => {
    //test this after there is a button firing the request on FE
    Listing.findById(req.params.listingId)
      .then(foundListing => {
        User.findById(foundListing.User)
          .then(listingUser => {
            if(listingUser.username === req.user.name){
              User.findByIdAndUpdate(req.params.listingId, { ...req.body }, { new: true });
            } else {
              const error = new Error('Unauthorized to edit listing');
              error.status = 480;
              return next(error);
            }
          });
      })
      .catch(next);
  })

  .delete('/:listingId', (req, res, next) => {
    //test this after there is a button firing the request on FE
    Listing.findById(req.params.listingId)
      .then(foundListing => {
        User.findById(foundListing.User)
          .then(listingUser => {
            if(listingUser.username === req.user.name){
              User.findByIdAndUpdate(req.params.listingId, { archived: true }, { new: true });
            } else {
              const error = new Error('Unauthorized to edit listing');
              error.status = 480;
              return next(error);
            }
          });
      })
      .catch(next);
  });
