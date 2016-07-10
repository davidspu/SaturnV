var mongoose = require('mongoose');

var contactSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  emails: {
    type: Array
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
