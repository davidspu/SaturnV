var mongoose = require('mongoose');

var connect = process.env.MONGODB_URI || require('./connect');
mongoose.connect(connect);

var contactSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  emails: {
    type: Array,
    required: true
  }
  name: {
    type: String
  },
  milestones: {
  	type: Array
  },
  sentiment: {
    type: String
  }
});

module.exports = contact.model('Contact', contactSchema)