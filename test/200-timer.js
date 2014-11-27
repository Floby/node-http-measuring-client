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

    it('returns the current time', function () {
      clock.tick(25000);
      expect(timer.start()).to.equal(25000);
    });

    describe('.peek(key)', function () {
      it('is a function', function () {
        expect(timer).to.have.property('peek');
        expect(timer.peek).to.be.a('function');
      });

      it('returns the time elapsed since the call to start(key)', function () {
        timer.start('aaa');
        clock.tick(5000);
        expect(timer.peek('aaa')).to.equal(5000);
      });

      describe('when called again later', function () {
        it('still returns the time elapsed sine the call to start(key)', function () {
          timer.start('aaa');
          clock.tick(2000);
          timer.peek('aaa');
          clock.tick(4000);
          expect(timer.peek('aaa')).to.equal(6000);
        });
      });
    });

    describe('.stop(key)', function () {
      beforeEach(function () {
        timer.start('myKey');
      });
      it('returns the time elapsed since the call to start() with the same key (milliseconds)', function () {
        clock.tick(400);
        expect(timer.stop('myKey')).to.equal(400);
      });

      describe('.peek(key) called later', function () {
        it('returns the time elapsed until stopped', function () {
          clock.tick(400);
          timer.stop('myKey');
          clock.tick(300);
          expect(timer.peek('myKey')).to.equal(400);
        });
      });

      describe('when called again', function () {
        beforeEach(function () {
          clock.tick(200);
          timer.stop('myKey');
          clock.tick(200);
        });
        it('returns the same result as the first time', function () {
          expect(timer.stop('myKey')).to.equal(200);
        });
      });
    });

    describe('with a later call to .start(otherKey)', function () {
      beforeEach(function () {
        timer.start('myKey');
        clock.tick(200);
        timer.start('myOtherKey');
        clock.tick(100);
      });
      describe('.stop(key)', function () {
        it('return the time elapsed since the call to start with the same key', function () {
          expect(timer.stop('myKey')).to.equal(300);
        });
      });

      describe('.stop(otherKey)', function () {
        it('returns the time since the call to start with otherKey', function () {
          expect(timer.stop('myOtherKey')).to.equal(100);
        })
      })
    });

    describe('.toJSON()', function () {
      beforeEach(function () {
        timer.start('keyA');
        clock.tick(100);
        timer.start('keyB');
        timer.start('keyC');
        clock.tick(500);
        timer.start('keyD');
        clock.tick(1000);
      });
      it('returns an object with all the durations since each call to start', function () {
        expect(timer.toJSON()).to.deep.equal({
          keyA: 1600,
          keyB: 1500,
          keyC: 1500,
          keyD: 1000
        });
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
