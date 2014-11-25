var url = require('url');
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
          if(onResponse) request.on('response', onResponse);
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

      describe('the emitted event', function () {
        var listenerArgs;
        beforeEach(function (done) {
          mhttp.on('stat', function() {
            listenerArgs = [].slice.call(arguments);
          });
          mhttp.request('http://bidu.le/');
          request.emit('response', response);
          process.nextTick(function () {
            response.emit('end');
            done();
          });
        });

        it('is called with the parsed uri', function () {
          var uri = listenerArgs[0];
          expect(uri).to.be.an('object');
          expect(uri).to.have.property('host');
          expect(uri).to.have.property('hostname');
          expect(uri).to.have.property('path');
          expect(uri).to.have.property('protocol');
          expect(url.format(uri)).to.equal('http://bidu.le/');
        });
      });

      describe('when called on a options hash', function () {
        var listenerArgs;
        var options = {
          protocol: 'http',
          hostname: 'bidu.le',
          path: '/'
        };
        beforeEach(function (done) {
          mhttp.on('stat', function() {
            listenerArgs = [].slice.call(arguments);
          });
          mhttp.request(options);
          request.emit('response', response);
          setTimeout(function () {
            response.emit('end');
            done();
          }, 100);
        });

        it('is called with the parsed uri', function () {
          var uri = listenerArgs[0];
          expect(uri).to.equal(options);
          expect(url.format(uri)).to.equal('http://bidu.le');
        });

        describe('when the request takes some time to reply', function () {
          it('is called with a stats object, with a totalTime field', function () {
            var stats = listenerArgs[1];
            expect(stats).to.be.an('object');
            expect(stats).to.have.property('totalTime');
            expect(stats.totalTime).to.be.within(100, 102); // setTimeout is not that perfect
          });
        });
      });
    })
  });
})
