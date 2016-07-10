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
  token: {},
  refresh: {
    type: String
  }
});

userSchema.statics.findOrCreate = function(obj, obj2, cb) { //statics: fns that are called by class (d/n belong to each object)
    this.findOne({googleId: obj.googleId}, function(err, user){
        if(err){
            throw new Error(err);
        } else if(!user){
            var u = new this({
                email: obj2.email,
                name: obj2.name,
                googleId: obj2.googleId,
                token: obj2.token,
                refresh: obj2.refresh
            }).save(function(error, user){
                if(error){
                    cb(error, null);
                } else {
                    cb(null, user);
                }
            });
        } else {
            cb(null, user);
        }
    }.bind(this));
};

// userSchema.plugin(findOrCreate);
module.exports = mongoose.model('User', userSchema);
