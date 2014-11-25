var expect = require('chai').expect;
var sinon = require('sinon');
var Timer = require('../lib/timer');

describe('timer', function () {
  var clock;
  beforeEach(function () {
    clock = sinon.useFakeTimers();
  });
  afterEach(function () {
    clock.restore();
  });
  var timer;
  beforeEach(function () {
    timer = Timer();
  });

  it('is a constructor', function () {
    expect(timer).to.be.an.instanceof(Timer);
  });

  describe('.start(key)', function () {

    it('is a function', function () {
      expect(timer).to.have.property('start');
      expect(timer.start).to.be.a('function');
    });

    describe('.stop(key)', function () {
      beforeEach(function () {
        timer.start('myKey');
      });
      it('returns the time elapsed since the call to start() with the same key (milliseconds)', function () {
        clock.tick(400);
        expect(timer.stop('myKey')).to.equal(400);
      });
    });
  });

  describe('.stop(key)', function () {
    describe('with no previous call to start', function () {
      it('returns 0', function () {
        expect(timer.stop('myOtherKey')).to.equal(0);
      })
    });
  })
})
