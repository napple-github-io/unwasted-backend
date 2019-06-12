require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('../../lib/models/Listing');

describe('Listing Model', () => {
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

  const listing = new Listing({
    title: 'carrots',
    user: new mongoose.Types.ObjectId(),
    location: {
      address: '555 high st.',
      zip: '555'
    },
    category: 'produce',
    dietary: { dairy: true, gluten: true }
  });

  it('has expected values for listing', () => {
    expect(listing.toJSON()).toEqual({
      title: 'carrots',
      _id: expect.any(mongoose.Types.ObjectId),
      user: expect.any(mongoose.Types.ObjectId),
      location: {
        address: '555 high st.',
        zip: '555'
      },
      category: 'produce',
      dietary: { dairy: true, gluten: true },
      postedDate: expect.any(String),
      expiration: expect.any(String),
      archived: false
    });
  });

  it('requires certain inputs', () => {
    const listed = new Listing({});
    const errors = listed.validateSync().errors;
    expect(errors.title.message).toEqual('Path `title` is required.');
    expect(errors.user.message).toEqual('Path `user` is required.');
    expect(errors.category.message).toEqual('Path `category` is required.');  
  });
});
