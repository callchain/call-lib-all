'use strict';
var createHash = require('create-hash');


function sha512half(buffer) {
  var sha512 = createHash('sha512');
  return sha512.update(buffer).digest('hex').toUpperCase().slice(0, 64);
}

module.exports = sha512half;
