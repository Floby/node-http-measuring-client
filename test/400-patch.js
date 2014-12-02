var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon = require('sinon');
var EventEmitter = require('events').EventEmitter;

describe('an instance', function () {
  describe('.mixin(module)', function () {
    it('monkey-patches the request() method of the provided module', function () {
      var req = new EventEmitter();
      var onResponse = sinon.spy(); onResponse.coucou = 'salut';
      var original = sinon.spy(function (options, cb) {
        return req;
      })
      var http = {
        request: original
      };
      var mhttp = require('../').create(http);
      sinon.spy(mhttp, 'request');
      mhttp.mixin(http);
      expect(http.request).not.to.equal(original, 'method was not patched');

      var actual = http.request('http://google.com', onResponse);

      assert(mhttp.request.calledWith('http://google.com', onResponse), 'override request() should get called with options');
      assert(original.calledWith('http://google.com', onResponse), "original was not called in turn");
      expect(actual).to.equal(req);
    });
  });
});
