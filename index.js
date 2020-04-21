var url = require('url');
var http = require('http');
var https = require('https');
var EventEmitter = require('events').EventEmitter;
var mixin = require('merge-descriptors');
var Timer = require('./lib/timer');
module.exports = {
  create: createHttp,
  createSecure: createHttps
}

function createHttp(httpModule) {
  var httpModule = httpModule || http;
  var MeasureHttp = Object.create(httpModule);
  mixin(MeasureHttp, EventEmitter.prototype);
  MeasureHttp.request = request;
  MeasureHttp.get = get;
  MeasureHttp.mixin = patchMethods;
  MeasureHttp.unmix = unpatchMethods;

  return MeasureHttp;

  function request (options, onResponse) {
    var uri = getUriFromOptions(options);
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

  function getUriFromOptions (options) {
    var uri = options;
    if(typeof uri === 'string') uri = url.parse(uri);
    if(uri.uri) uri = uri.uri
    return uri;
  }

  function setupTimerForRequest (timer, req, uri) {
    setImmediate(() => timer.start('processingTime'));
    setImmediate(() => timer.start('connectionTime'));
    req.on('socket', () => timer.stop('connectionTime'));
    req.on('response', function(response) {
      timer.stop('processingTime');
      timer.start('transmittingTime');
      response.on('end', function() {
        timer.stop('transmittingTime');
        var json = timer.toJSON();
        json.statusCode = response.statusCode;
        json.method = req.method || 'GET';
        json.success = true
        MeasureHttp.emit('stat', uri, json);
      });
    });
    req.on('error', (error) => {
      const times = timer.toJSON()
      MeasureHttp.emit('stat', uri, {
        ...times,
        success: false,
        method: req.method || 'GET',
        error,
        errorMessage: error.message,
        errorCode: error.code,
        errorErrno: error.errno,
        errorShort: error.code || error.errno
      })
    })
  }


  function patchMethods (httpToPatch) {
    monkeyPatch(httpToPatch, 'request');
    monkeyPatch(httpToPatch, 'get');
  }

  function monkeyPatch (httpToPatch, method) {
    var original = httpToPatch[method];
    var override = MeasureHttp[method];
    httpToPatch[method] = patched;
    Object.defineProperty(patched, '_isPatch', { value: PATCH_FLAG });
    Object.defineProperty(patched, '_orignal', { value: original });
    patched._original = original;

    function patched (options, onResponse) {
      // hot-replace in case httpToPatch is the
      // httpModule we are using
      httpToPatch[method] = original;
      var req = override(options, onResponse);
      httpToPatch[method] = patched;
      return req;
    }
  }

  function unpatchMethods (patchedHttp) {
    ['request', 'get'].forEach(function (method) {
      if(usingPatched(patchedHttp[method])) {
        patchedHttp[method] = patchedHttp[method]._original;
      }
    });
  }

  function usingPatched (func) {
    return func._isPatch === PATCH_FLAG;
  }
};

var PATCH_FLAG = {};

function createHttps () {
  return module.exports.create(https);
};
