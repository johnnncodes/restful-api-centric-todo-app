var crypto = require('crypto');

exports.hash = function(val){
  var hash = crypto.createHash('sha256');
  return hash.update(val).digest('hex');
};