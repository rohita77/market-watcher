'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var symbolCtrlStub = {
  index: 'symbolCtrl.index',
  show: 'symbolCtrl.show',
  create: 'symbolCtrl.create',
  upsert: 'symbolCtrl.upsert',
  patch: 'symbolCtrl.patch',
  destroy: 'symbolCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var symbolIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './symbol.controller': symbolCtrlStub
});

describe('Symbol API Router:', function() {
  it('should return an express router instance', function() {
    expect(symbolIndex).to.equal(routerStub);
  });

  describe('GET /api/symbols', function() {
    it('should route to symbol.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'symbolCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/symbols/:id', function() {
    it('should route to symbol.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'symbolCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/symbols', function() {
    it('should route to symbol.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'symbolCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/symbols/:id', function() {
    it('should route to symbol.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'symbolCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/symbols/:id', function() {
    it('should route to symbol.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'symbolCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/symbols/:id', function() {
    it('should route to symbol.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'symbolCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
