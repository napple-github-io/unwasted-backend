require('dotenv').config();
const mongoose = require('mongoose');
const Review = require('../../lib/models/Review');

describe('Review Model', () => {
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
      
  const id = new mongoose.Types.ObjectId;

  const review = new Review({
    reviewer: id,
    reviewee: id,
    reviewText: 'super punctual',
    good: true,
  });
  it('validates a good Review model', () => {

    expect(review.toJSON()).toEqual({
      reviewer: id,
      reviewee: id,
      reviewText: 'super punctual',
      good: true,
      postedDate: expect.any(String),
      _id: expect.any(mongoose.Types.ObjectId)
    });
  });

  it('has some required fields', () => {
    const malformedReview = new Review({
      reviewText: 'super punctual',
    });

    const errors = malformedReview.validateSync().errors;
    expect(errors.reviewer.message).toEqual('Path `reviewer` is required.');
    expect(errors.reviewee.message).toEqual('Path `reviewee` is required.');
    expect(errors.good.message).toEqual('Path `good` is required.');
  });
});
