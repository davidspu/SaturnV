var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  name: {
    type: String
  },
  contacts: {
  	type: Array
  }
});

module.exports = mongoose.model('User', userSchema)
