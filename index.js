var http = require('http');
var EventEmitter = require('events').EventEmitter;
var mixin = require('merge-descriptors');

exports.create = function createHttp() {
  var MeasureHttp = Object.create(http);
  mixin(MeasureHttp, EventEmitter.prototype);
  MeasureHttp.request = request;

  function request (options, onResponse) {
    var req = http.request(options, onResponse);
    req.on('response', function(response) {
      response.on('end', function() {
        MeasureHttp.emit('stat');
      });
    });
    return req;
  }

  return MeasureHttp;
};
