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
      sinon.stub(http, 'request').returns({});
    });
    afterEach(function () {
      http.request.restore();
    })

    it('delegates calls to the native http.request', function () {
      mhttp.request('http://bidu.le');
      assert.equal(http.request.callCount, 1, 'not called');
      assert(http.request.calledWith('http://bidu.le'));
    });
  });
})
