var mongoose = require('mongoose');

var connect = process.env.MONGODB_URI || require('./connect');
mongoose.connect(connect);

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