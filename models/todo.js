var mongoose = require('mongoose');
var crypto = require('crypto');
var utils = require('../libs/utils');
var validate = require('mongoose-validator').validate;

var TodoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  user : {
    type : mongoose.Schema.ObjectId,
    ref : 'Account'
  },
  createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Todo', TodoSchema);