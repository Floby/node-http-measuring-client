var EventEmitter = require('events').EventEmitter;
var expect = require('chai').expect;
var assert = require('chai').assert;
var http = require('http');
var sinon = require('sinon');

describe('measure-http', function () {
  var mhttp;

  beforeEach(function () {
    mhttp = require('../').create();
  });

  describe('.request()', function () {
    beforeEach(function () {
      sinon.stub(http, 'request').returns(new EventEmitter());
    });
    afterEach(function () {
      http.request.restore();
    })

    it('delegates calls to the native http.request', function () {
      mhttp.request('http://bidu.le');
      assert.equal(http.request.callCount, 1, 'not called');
      assert(http.request.calledWith('http://bidu.le'));
    });

    describe('when the response ends', function () {
      var request, response;
      beforeEach(function () {
        response = new EventEmitter();
        request = new EventEmitter();
        http.request.restore();
        sinon.stub(http, 'request', function (url, onResponse) {
          request.on('response', onResponse);
          return request;
        });
      });

      it('emits an event', function (done) {
        var onStat = sinon.spy();
        mhttp.request('http://bidu.le', function () {});
        mhttp.on('stat', onStat);

        request.emit('response', response);

        setTimeout(function () {
          response.emit('end');
          assert(onStat.calledOnce, 'event stat was not triggered');
          done();
        }, 20)
      });
    })
  });
})
