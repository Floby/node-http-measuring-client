var url = require('url');
var http = require('http');
var EventEmitter = require('events').EventEmitter;
var mixin = require('merge-descriptors');
var Timer = require('./lib/timer');

exports.create = function createHttp() {
  var MeasureHttp = Object.create(http);
  mixin(MeasureHttp, EventEmitter.prototype);
  MeasureHttp.request = request;
  MeasureHttp.get = get;

  return MeasureHttp;

  function request (options, onResponse) {
    var uri = options;
    if(typeof uri === 'string') uri = url.parse(uri);
    var timer = new Timer();
    timer.start('totalTime');
    var req = http.request(options, onResponse);
    req.on('response', function(response) {
      response.on('end', function() {
        MeasureHttp.emit('stat', uri, timer.toJSON());
      });
    });
    return req;
  }

  function get (options, onResponse) {
    var req = request(options, onResponse);
    req.end();
    return req;
  }

};
