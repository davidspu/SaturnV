var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  contacts: {
  	type: Array
  },
  googleId: {
    type: String
  },
  token: {
    type: String
  },
  refresh: {
    type: String
  }
});

userSchema.plugin(findOrCreate);
module.exports = mongoose.model('User', userSchema)
