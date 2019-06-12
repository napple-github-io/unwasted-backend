require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../../lib/models/User');
const { untokenize } = require('../../lib/utils/token');

describe('User model', () =>{
  beforeAll(() => {
    return mongoose.connect('mongodb://localhost:27017/napple', {
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

  const user = new User({
    username: 'wookie',
    password: 'goobers',
    email: 'feet@shoes.com',
    location: { address: '1919 NW Quimby St., Portland, Or', zip: '97209' },
    role: 'User'
  });

  it('has a username, email password and address', () => {
    expect(user.toJSON()).toEqual({
      username: 'wookie',
      email: 'feet@shoes.com',
      location: { address: '1919 NW Quimby St., Portland, Or', zip: '97209' },
      role: 'User',
      powerUser: false,
      _id: expect.any(mongoose.Types.ObjectId)
    });
  });

  it('returns with a passwordHash', () => {
    expect(user._tempPassword).toEqual('goobers');
  });

  it('compares a good password', () => {
    return User.create({
      username: 'wookie',
      password: 'goobers',
      email: 'feet@shoes.com',
      location: { address: '1919 NW Quimby St., Portland, Or', zip: '97209' },
      role: 'User',
    })
      .then(created => {
        return created.compare('goobers');
      })
      .then(result => {
        expect(result).toBeTruthy();
      });
  });

  it('compares a bad password', () => {
    return User.create({
      username: 'wookie',
      password: 'goobers',
      email: 'feet@shoes.com',
      location: { address: '1919 NW Quimby St., Portland, Or', zip: '97209' },
      role: 'User'
    })
      .then(created => {
        return created.compare('bananas');
      })
      .then(result => {
        expect(result).toBeFalsy();
      });
  });

  it('create an authToken', () => {
    return User.create({
      username: 'wookie',
      password: 'goobers',
      email: 'feet@shoes.com',
      location: { address: '1919 NW Quimby St., Portland, Or', zip: '97209' },
      role: 'User'
    })
      .then(createdUser => {
        const token = createdUser.authToken();
        const payload = untokenize(token);
        expect(payload).toEqual({
          username: 'wookie',
          _id: createdUser._id.toString(),
          email: 'feet@shoes.com',
          location: { address: '1919 NW Quimby St., Portland, Or', zip: '97209' },
          role: 'User',
          powerUser: false
        });
      });
  });
  
  it('finds by token', () => {
    return User.create({
      username: 'wookie',
      password: 'goobers',
      email: 'feet@shoes.com',
      location: { address: '1919 NW Quimby St., Portland, Or', zip: '97209' },
      role: 'User'
    })
      .then(createdUser => {
        return createdUser.authToken();   
      })
      .then(token => User.findByToken(token))
      .then(results => {
        expect(results).toEqual({
          username: 'wookie',
          email: 'feet@shoes.com',
          location: { address: '1919 NW Quimby St., Portland, Or', zip: '97209' },
          role: 'User',
          _id: expect.any(String),
          powerUser: false
        });
      });
  });
});
