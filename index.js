var http = require('http');

exports.create = function createHttp() {
  return Object.create(http);
};
