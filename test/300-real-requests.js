var url = require('url');
var sinon = require('sinon');
var blackhole = require('stream-blackhole');
var expect = require('chai').expect;

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
  });
});
