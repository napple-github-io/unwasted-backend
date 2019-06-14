const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  authId: {
    type: String,
    required: true
  },
  location: {
    street:{
      type: String,
      required: true
    },
    state:{
      type: String,
      required: true
    },
    zip:{
      type: String,
      required: true
    }
  },
  powerUser:{
    type: Boolean,
    required: true,
    default: false
  },
  role: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'User'
  },
  standing: {
    Type: String
  }
},
{
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v; 
    }
  }
});

userSchema.statics.getPowerUsers = function() {
  return this.model('Listing').aggregate([
    {
      '$group': {
        '_id': '$user', 
        'count': {
          '$sum': 1
        }
      }
    }, {
      '$sort': {
        'count': -1
      }
    }, {
      '$lookup': {
        'from': 'users', 
        'localField': '_id', 
        'foreignField': '_id', 
        'as': 'user'
      }
    }, {
      '$unwind': {
        'path': '$user'
      }
    }, {
      '$project': {
        'count': '$count', 
        'username': '$user.username', 
        'address': '$user.location.address', 
        'zip': '$user.location.zip', 
        'email': '$user.email'
      }
    }, {
      '$match': {
        'count': {
          '$gte': 3
        }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema);
