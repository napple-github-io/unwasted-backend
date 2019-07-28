const { Router } = require('express');
const Listing = require('../models/Listing');
const User = require('../models/User');
const sgMail = require('@sendgrid/mail');
const ensureAuth = require('../middleware/ensure-auth');
const parseBoolean = require('../utils/parseBoolean');
const { getDistanceString, getDistanceNumber } = require('../utils/distanceCalc');
const upload = require('../services/imageTransfer');

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
      .find({ archived: false })
      .populate({ path: 'user', select: 'username' })
      .select({ __v: false })
      .lean()
      .then(allListings => res.send(allListings))
      .catch(next);
  })

  .get('/user', (req, res, next) => {
    Listing
      .find({ user: req.query.id, archived: false })
      .select({ __v: false })
      .lean()
      .then(listings => {
        User.findById(req.query.id)
          .lean()
          .then(user => {
            return Promise.all(listings.map(listing => {
              return { ...listing, user: { _id: user._id, username: user.username } };
            }))
              .then(listWithUsername => res.send(listWithUsername));
          });
      })
      .catch(next);
  })

  .get('/distance', (req, res, next) => {
    const { origin } = req.query;
    Listing
      .find({ archived: false })
      .populate({ path: 'user', select: 'username' })
      .select({ __v: false })
      .lean()
      .then(listings => {
        // console.log(listings);
        return Promise.all(listings.map(listing => {
          return getDistanceString(origin, listing.location.street);
        })).then(distances => {
          return distances.map((distance, i) => {
            return { ...listings[i], _id: listings[i]._id, distance };
          });
        })
          .then(arrayOfDetailedListings => {
            res.send(arrayOfDetailedListings);
          });
      })
      .catch(next);
  })

  .get('/search', (req, res, next) => {
    const parsedForDietary = parseBoolean(req.query);
    let searchObj = {};
    const { distance, origin } = req.query;
    if(req.query.category) searchObj.category = req.query.category;
    Listing
      .find({ ...searchObj, ...parsedForDietary, archived: false })
      .select()
      .lean()
      .then(listings => {
        if(distance && origin) {
          return Promise.all(listings.map(listing => {
            return getDistanceNumber(origin, listing);
          }))
            .then(listingsWithDistance => {
              return listingsWithDistance.filter(listing => listing.distance <= distance);
            })
            .then(nearbyListings => res.send(nearbyListings));
        }
        res.send(listings);
      })
      .catch(next);
  })

  .get('/:listingId', (req, res, next) => {
    //CHANGE THE POPULATE TO NOT INCLUDE EMAIL/ADDRESS
    Listing
      .findById(req.params.listingId)
      .populate({ path:'user', select:'username userImage' })
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

  .delete('/:listingId', ensureAuth(), (req, res, next) => {
    //test this after there is a button firing the request on FE
    Listing.findById(req.params.listingId)
      .then(foundListing => {
        User.findById(foundListing.user)
          .then(listingUser => {
            if(listingUser.username === req.user.name){
              return Listing
                .findByIdAndUpdate(req.params.listingId, { archived: true }, { new: true })
                .select({
                  _id: true,
                  archived: true
                })
                .lean()
                .then(archived => res.send(archived))
                .catch(next);
            } else {
              const error = new Error('Unauthorized to edit listing');
              error.status = 480;
              return next(error);
            }
          })
          .catch(next);
      })
      .catch(next);
  })

  .post('/upload', upload.single('file'), function(req, res) {
    return res.send({ file: res.req.file.location });
  });
