const mongoose = require('mongoose');
const { hash, compare } = require('../utils/hash');
const { untokenize, tokenize } = require('../utils/token');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
  },

  location: {
    address:{
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
      delete ret.passwordHash;
      delete ret.__v; 
    }
  }
});

userSchema.virtual('password').set(function(password) {
  this._tempPassword = password;
});

userSchema.pre('save', function(next) {
  hash(this._tempPassword)
    .then(hashedPassword => {
      this.passwordHash = hashedPassword;
      next();
    });
});

userSchema.methods.compare = function(password) {
  return compare(password, this.passwordHash);
};

userSchema.methods.authToken = function() {
  return tokenize(this.toJSON());
};

userSchema.statics.findByToken = function(token) {
  return Promise.resolve(untokenize(token));
};

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
