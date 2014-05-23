var mongoose = require('mongoose');
var crypto = require('crypto');
var utils = require('../libs/utils');
var validate = require('mongoose-validator').validate;

var AccountSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [
      validate('isEmail')
    ]
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {type: Date, default: Date.now}
});

/// virtuals
AccountSchema.virtual('passwordConfirmation')
.get(function() {
  return this._passwordConfirmation;
})
.set(function(value) {
  this._passwordConfirmation = value;
});

/// custom validations
AccountSchema.path('password').validate(function(password) {

  // @TODO: double check if implementation of determining if a document doesn't
  //        already exist in mongodb since I'm not sure if document.isNew is the
  //        correct solution.
  // Only run validation if the user is not already registered
  if (! this.isNew) {
    return true;
  }

  if (password !== this.passwordConfirmation) {
    return false;
  }
}, "Password and confirm password doesn't match");

/// hooks
AccountSchema.pre('save', function(next) {
  if (! this.isNew) {
    return next();
  }

  console.log('Pre save hook: Setting password...');
  this.password = utils.hash(this.password);
  next();
});

/// methods

// Password verification
AccountSchema.methods.comparePassword = function(candidatePassword, callback) {

  var hash = utils.hash(candidatePassword);

  if (hash === this.password) {
    callback(null, true);
  } else {
    callback(new Error("Password doesn't match"));
  }

};

module.exports = mongoose.model('Account', AccountSchema);