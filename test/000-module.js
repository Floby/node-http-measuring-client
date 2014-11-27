var expect = require('chai').expect;

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
  });
})
