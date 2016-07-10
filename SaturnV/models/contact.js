var mongoose = require('mongoose');

var contactSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  emails: {
    type: Array
  },
  name: {
    type: String
  },
  milestones: {
  	type: Array
  },
  score: {
    type: String
  }
});

module.exports = mongoose.model('Contact', contactSchema)
