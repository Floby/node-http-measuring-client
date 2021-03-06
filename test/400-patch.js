var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon = require('sinon');
var EventEmitter = require('events').EventEmitter;

describe('an instance', function () {
  describe('.mixin(module)', function () {
    it('monkey-patches the request() method of the provided module', function () {
      var req = new EventEmitter();
      var onResponse = sinon.spy();
      var original = sinon.stub().returns(req);
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

    it('monkey-patches the get() method of the provided module', function () {
      var req = new EventEmitter();
      req.end = sinon.spy();
      var onResponse = sinon.spy();
      var original = sinon.stub().returns(req);
      var originalGet = sinon.spy();
      var http = {
        request: original,
        get: originalGet
      };
      var mhttp = require('../').create(http);
      sinon.spy(mhttp, 'get');
      mhttp.mixin(http);
      expect(http.get).not.to.equal(originalGet, 'method was not patched');

      var actual = http.get('http://google.com', onResponse);

      assert(mhttp.get.calledWith('http://google.com', onResponse), 'override get() should get called with options');
      assert(original.calledWith('http://google.com', onResponse), "original was not called in turn");
      assert(req.end.calledOnce, 'end() is called this time');
      expect(actual).to.equal(req);
    });

    describe('.unmix(module)', function () {
      var originalGet,
          originalRequest,
          req,
          mhttp,
          http;

      beforeEach(function () {
        req = new EventEmitter();
        originalGet = sinon.stub().returns(req);
        originalRequest = sinon.stub().returns(req);
        http = {
          get: originalGet,
          request: originalRequest
        }
        mhttp = require('../').create(http);
        mhttp.mixin(http);
      })

      it('sets the get method back to its original value', function () {
        mhttp.unmix(http);
        expect(http.get).to.equal(originalGet);
      });
      it('sets the request method back to its original value', function () {
        mhttp.unmix(http);
        expect(http.request).to.equal(originalRequest);
      });

      describe('called twice', function () {
        it('does nothing and does not throw', function () {
          mhttp.unmix(http);
          mhttp.unmix(http);
          expect(http.request).to.equal(originalRequest);
          expect(http.get).to.equal(originalGet);
        });
      })
    });
  });

});
