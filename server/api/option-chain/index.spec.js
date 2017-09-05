'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var optionChainCtrlStub = {
  index: 'optionChainCtrl.index',
  show: 'optionChainCtrl.show',
  create: 'optionChainCtrl.create',
  upsert: 'optionChainCtrl.upsert',
  patch: 'optionChainCtrl.patch',
  destroy: 'optionChainCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var optionChainIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './option-chain.controller': optionChainCtrlStub
});

describe('OptionChain API Router:', function() {
  it('should return an express router instance', function() {
    expect(optionChainIndex).to.equal(routerStub);
  });

  describe('GET /y', function() {
    it('should route to optionChain.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'optionChainCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /y/:id', function() {
    it('should route to optionChain.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'optionChainCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /y', function() {
    it('should route to optionChain.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'optionChainCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /y/:id', function() {
    it('should route to optionChain.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'optionChainCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /y/:id', function() {
    it('should route to optionChain.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'optionChainCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /y/:id', function() {
    it('should route to optionChain.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'optionChainCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
