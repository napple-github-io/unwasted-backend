require('dotenv').config();
const request = require('supertest');
const app = require('../../lib/app');
const mongoose = require('mongoose');

describe('auth routes', () => {
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
    location: {
      street: '1919 NW Quimby St., Portland, Or',
      state: 'MO',
      zip: '97209'
    }
  };

  it('creates a user in db', () => {
    return request(app)
      .post('/api/v1/auth/signup')
      .send(user)
      .then(createdUser => {
        expect(createdUser.body).toEqual({
          ...user,
          _id: expect.any(String),
          powerUser: false,
          role: 'User'
        });
      });
  });
});
