var EventEmitter = require('events').EventEmitter;
var sinon = require('sinon');
var expect = require('chai').expect;
var assert = require('chai').assert;

describe('the module', function () {
  it('is requirable', function () {
    require('../');
  });

  describe('.create()', function () {
    it('is a function', function () {
      var module = require('../');
      expect(module).to.have.property('create');
      expect(module.create).to.be.a('function')
    });

    describe('return value', function () {
      var module = require('../');
      it('is an object', function () {
        expect(module.create()).to.be.an('object');
      });

      it('quacks like a http module', function () {
        var http = module.create();
        expectMethod('get');
        expectMethod('request');
        expectMethod('createServer');
        function expectMethod (name) {
          expect(http).to.have.property(name);
          expect(http[name]).to.be.a('function');
        };
      });

      it('is not the http module though', function () {
        var mhttp = module.create();
        var http = require('http');
        expect(mhttp).not.to.equal(http, 'should not be the same object');
      });
    });

    describe('when given an argument', function () {
      it('delegates to that object instead of the built-in http', function () {
        var MyHttp = {request: sinon.stub().returns(new EventEmitter())};
        var http = require('../').create(MyHttp);
        var onResponse = sinon.spy();
        http.request('http://google.com', onResponse);
        assert(MyHttp.request.calledWith('http://google.com', onResponse), 'call was not delegated');
      });
    });
  });

  describe('.createSecure()', function () {
    var module;
    beforeEach(function () {
      module = require('../');
      sinon.stub(module, 'create').returns({});
    })
    afterEach(function () {
      module.create.restore();
    })
    it('calls create() with the default https module', function () {
      module.createSecure();
      assert(module.create.calledWith(require('https')), 'create not called with https');
    });
  });
})
