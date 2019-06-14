require('dotenv').config();
const request = require('supertest');
const app = require('../../lib/app');
const mongoose = require('mongoose');

describe('listing routes', () => {
  beforeAll(() => {
    return mongoose.connect('mongodb://localhost:27017/unwastedtest', {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true
    });
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  afterAll(() => {
    return mongoose.connection.close();
  });

  const user = {
    username: 'wookie',
    email: 'feet@shoes.com',
    firstName: 'Sean',
    lastName: 'Michael',
    authId: 'cjasjd',
    location: { street: '1919 NW Quimby St., Portland, Or', state: 'MO', zip: '97209' }
  };
  
  const listing = {
    title: 'title', 
    location: {
      street: '555 high st.',
      state: 'AZ',
      zip: '85032'
    },
    category: 'produce',
    dietary: { dairy: true, gluten: true }
  };

  it('creates a listing in db', () => {
    return request(app)
      .post('/api/v1/auth/signup')
      .send(user)
      .then(createdUser => {
        return request(app)
          .post('/api/v1/listings')
          .send({ ...listing, user: createdUser.body._id })
          .then(createdListing => {
            expect(createdListing.body.user).toEqual(createdUser.body._id);
            expect(createdListing.body.category).toEqual('produce');
          });
      });
  });

  it('can get all listings', () => {
    return request(app)
      .post('/api/v1/auth/signup')
      .send(user)
      .then(createdUser => {
        return request(app)
          .post('/api/v1/listings')
          .send({ ...listing, user: createdUser.body._id })
          .then(() => {
            return request(app)
              .get('/api/v1/listings')
              .then(allListings => {
                expect(allListings.body).toHaveLength(1);
              });
          });
      });
  });
});
