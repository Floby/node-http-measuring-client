var url = require('url');
var http = require('http');
var EventEmitter = require('events').EventEmitter;
var mixin = require('merge-descriptors');

exports.create = function createHttp() {
  var MeasureHttp = Object.create(http);
  mixin(MeasureHttp, EventEmitter.prototype);
  MeasureHttp.request = request;

  return MeasureHttp;

  function request (options, onResponse) {
    var uri = options;
    if(typeof uri === 'string') uri = url.parse(uri);
    var req = http.request(options, onResponse);
    req.on('response', function(response) {
      response.on('end', function() {
        MeasureHttp.emit('stat', uri);
      });
    });
    return req;
  }

};
