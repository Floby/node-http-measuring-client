var url = require('url');
var http = require('http');
var https = require('https');
var EventEmitter = require('events').EventEmitter;
var mixin = require('merge-descriptors');
var Timer = require('./lib/timer');

exports.create = function createHttp(httpModule) {
  var httpModule = httpModule || http;
  var MeasureHttp = Object.create(httpModule);
  mixin(MeasureHttp, EventEmitter.prototype);
  MeasureHttp.request = request;
  MeasureHttp.get = get;
  MeasureHttp.mixin = patchMethods;

  return MeasureHttp;

  function request (options, onResponse) {
    var uri = options;
    if(typeof uri === 'string') uri = url.parse(uri);
    var timer = new Timer();
    timer.start('totalTime');
    var req = httpModule.request(options, onResponse);
    setImmediate(timer.start.bind(timer, 'processingTime'));
    setImmediate(timer.start.bind(timer, 'connectionTime'));
    req.on('socket', timer.stop.bind(timer, 'connectionTime'));
    req.on('response', function(response) {
      timer.stop('processingTime');
      timer.start('transmittingTime');
      response.on('end', function() {
        timer.stop('transmittingTime');
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

  function patchMethods (httpToPatch) {
    var originalRequest = httpToPatch.request;
    var overrideRequest = MeasureHttp.request;
    httpToPatch.request = patchedRequest;

    function patchedRequest (options, onResponse) {
      // hot replacement in case httpToPatch is the httpModule
      // we are using
      httpToPatch.request = originalRequest;
      var req = overrideRequest(options, onResponse);
      httpToPatch.request = patchedRequest;
      return req;
    }
  }

};

exports.createSecure = function () {
  return exports.create(https);
};
