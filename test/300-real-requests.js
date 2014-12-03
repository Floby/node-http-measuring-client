var url = require('url');
var sinon = require('sinon');
var blackhole = require('stream-blackhole');
var expect = require('chai').expect;
var assert = require('chai').assert;

describe('When making actual requests', function () {
  var mhttp, server;
  
  beforeEach(function (done) {
    mhttp = require('../').create();
    server = mhttp.createServer(function (req, res) {
      setTimeout(res.end.bind(res, 'Hello World\n'), 150);
    }).listen(0, function (err) {
      port = server.address().port;
      done(err)
    });
  });
  afterEach(function (done) {
    server.close(done);
  });


  it('measure the totalTime', function (done) {
    var onStat = sinon.spy(assertions);
    mhttp.on('stat', onStat);

    mhttp.request('http://localhost:'+port+'/hello', function (response) {
      response.pipe(blackhole()).on('finish', function () {
        expect(onStat.calledOnce).to.equal(true, 'onStat was not called');
      });
    }).end();

    function assertions (uri, stats) {
      expect(url.format(uri)).to.equal('http://localhost:'+port+'/hello');
      expect(stats.totalTime).to.be.within(150, 170);
      done();
    }
  });

  describe('with `request`', function () {
    var request;
    beforeEach(function () {
      request = require('request').defaults({
        httpModules: { 'http:': mhttp }
      });
    });

    it('emits stats with the options.uri object', function (done) {
      var onStat = sinon.spy(assertions);
      mhttp.on('stat', onStat);
      request('http://localhost:'+port+'/hello', function (err, res) {});

      function assertions (parsed, stat) {
        var uri = url.format(parsed);
        expect(uri).to.equal('http://localhost:'+port+'/hello');
        done();
      }
    });
  });

  describe('with method .get()', function () {
    it('measure the totalTime', function (done) {
      var onStat = sinon.spy(assertions);
      mhttp.on('stat', onStat);

      mhttp.get('http://localhost:'+port+'/hello', function (response) {
        response.pipe(blackhole()).on('finish', function () {
          expect(onStat.calledOnce).to.equal(true, 'onStat was not called');
        });
      });

      function assertions (uri, stats) {
        expect(url.format(uri)).to.equal('http://localhost:'+port+'/hello');
        expect(stats.totalTime).to.be.within(150, 170);
        done();
      }
    });
    describe('when monkey patching http', function () {
      it('does not trigger the event twice', function (done) {
        var http = require('http')
        mhttp.mixin(http);
        var onStat = sinon.spy();
        mhttp.on('stat', onStat);

        http.get('http://localhost:'+port+'/hello', function (response) {
          response.pipe(blackhole()).on('finish', function () {
            assert(onStat.callCount < 2, 'onStat called multiple times');
            done();
          });
        });
      });
    })
  });

});
