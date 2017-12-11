'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var dailyStatCtrlStub = {
  index: 'dailyStatCtrl.index',
  show: 'dailyStatCtrl.show',
  create: 'dailyStatCtrl.create',
  upsert: 'dailyStatCtrl.upsert',
  patch: 'dailyStatCtrl.patch',
  destroy: 'dailyStatCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var dailyStatIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './daily-stat.controller': dailyStatCtrlStub
});

describe('DailyStat API Router:', function() {
  it('should return an express router instance', function() {
    expect(dailyStatIndex).to.equal(routerStub);
  });

  describe('GET /api/daily-stats', function() {
    it('should route to dailyStat.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'dailyStatCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/daily-stats/:id', function() {
    it('should route to dailyStat.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'dailyStatCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/daily-stats', function() {
    it('should route to dailyStat.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'dailyStatCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/daily-stats/:id', function() {
    it('should route to dailyStat.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'dailyStatCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/daily-stats/:id', function() {
    it('should route to dailyStat.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'dailyStatCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/daily-stats/:id', function() {
    it('should route to dailyStat.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'dailyStatCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
