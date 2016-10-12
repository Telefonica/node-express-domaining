'use strict';

var events = require('events'),
    util = require('util'),
    proxyquire = require('proxyquire'),
    sinon = require('sinon');

describe('Domain Middleware Tests', function() {

  function Response() {
    events.EventEmitter.call(this);
    this.end = function() {
      this.emit('finish');
    };
  }
  util.inherits(Response, events.EventEmitter);

  function Domain() {
    events.EventEmitter.call(this);
    this.enter = function() {
    };
    this.run = function(handler) {
      process.nextTick(handler);
    };
    this.exit = function() {
    };
    this.add = function(emitter) {
    };
    this.remove = function(emitter) {
    };
  }
  util.inherits(Domain, events.EventEmitter);

  it('should create and clean a domain in normal conditions', function(done) {
    var req = {};
    var res = new Response();
    var domain = new Domain(false);
    var domainMock = {
      create: function() {return domain;}
    };
    var domainSpy = {
      enter: sinon.spy(domain, 'enter'),
      run: sinon.spy(domain, 'run'),
      exit: sinon.spy(domain, 'exit'),
      add: sinon.spy(domain, 'add'),
      remove: sinon.spy(domain, 'remove')
    };

    var DomainMiddleware = proxyquire('../../lib/domain', {
      'domain': domainMock
    });
    var domainMiddleware = new DomainMiddleware();
    domainMiddleware(req, res, function onNext() {
      expect(domainSpy.enter.calledOnce).to.be.true;
      expect(domainSpy.run.calledOnce).to.be.true;
      expect(domainSpy.add.withArgs(req).calledOnce).to.be.true;
      expect(domainSpy.add.withArgs(res).calledOnce).to.be.true;
      res.end();
      expect(domainSpy.remove.withArgs(req).notCalled).to.be.true;
      expect(domainSpy.remove.withArgs(res).notCalled).to.be.true;
      expect(domainSpy.exit.calledOnce).to.be.true;
      done();
    });
  });

  it('should create and clean a domain in error conditions', function(done) {
    var req = {};
    var res = new Response();
    var domain = new Domain(true);
    var domainMock = {
      create: function() {return domain;}
    };
    var domainSpy = {
      enter: sinon.spy(domain, 'enter'),
      run: sinon.spy(domain, 'run'),
      exit: sinon.spy(domain, 'exit'),
      add: sinon.spy(domain, 'add'),
      remove: sinon.spy(domain, 'remove')
    };

    var DomainMiddleware = proxyquire('../../lib/domain', {
      'domain': domainMock
    });

    var unhandlerError = new Error('test error');
    // get mocha exception handler
    var originalException = process.listeners('uncaughtException').pop()
    // and remove it
    process.removeListener('uncaughtException', originalException);

    var domainMiddleware = new DomainMiddleware();
    domainMiddleware(req, res, function onNext(propagatedError) {
      expect(domainSpy.enter.calledOnce).to.be.true;
      expect(domainSpy.run.calledOnce).to.be.true;
      expect(domainSpy.add.withArgs(req).calledOnce).to.be.true;
      expect(domainSpy.add.withArgs(res).calledOnce).to.be.true;
      
      if (propagatedError) {
        process.once('uncaughtException', function(err) {
          // restore mocha error handler
          process.listeners('uncaughtException').push(originalException)
          expect(err).to.be.eql(unhandlerError)
          expect(propagatedError).to.be.eql(unhandlerError)
          expect(domainSpy.remove.withArgs(req).notCalled).to.be.true;
          expect(domainSpy.remove.withArgs(res).notCalled).to.be.true;
          expect(domainSpy.exit.calledOnce).to.be.true;
          done();
        });
      }
      // Trigger error
      domain.emit('error', unhandlerError);
    });
  });

});
