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
    if(!usingPatched(httpModule.request)) {
      setupTimerForRequest(timer, req, uri);
    }
    return req;
  }

  function get (options, onResponse) {
    var req = request(options, onResponse);
    req.end();
    return req;
  }

  function setupTimerForRequest (timer, req, uri) {
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
  }


  function patchMethods (httpToPatch) {
    monkeyPatch(httpToPatch, 'request');
    monkeyPatch(httpToPatch, 'get');
  }

  function monkeyPatch (httpToPatch, method) {
    var original = httpToPatch[method];
    var override = MeasureHttp[method];
    httpToPatch[method] = patched;
    patched._isPatch = PATCH_FLAG;

    function patched (options, onResponse) {
      // hot-replace in case httpToPatch is the
      // httpModule we are using
      httpToPatch[method] = original;
      var req = override(options, onResponse);
      httpToPatch[method] = patched;
      return req;
    }
  }

  function usingPatched (func) {
    return func._isPatch === PATCH_FLAG;
  }
};

var PATCH_FLAG = {};

exports.createSecure = function () {
  return exports.create(https);
};
