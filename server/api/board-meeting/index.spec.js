'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var boardMeetingCtrlStub = {
  index: 'boardMeetingCtrl.index',
  show: 'boardMeetingCtrl.show',
  create: 'boardMeetingCtrl.create',
  upsert: 'boardMeetingCtrl.upsert',
  patch: 'boardMeetingCtrl.patch',
  destroy: 'boardMeetingCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var boardMeetingIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './board-meeting.controller': boardMeetingCtrlStub
});

describe('BoardMeeting API Router:', function() {
  it('should return an express router instance', function() {
    expect(boardMeetingIndex).to.equal(routerStub);
  });

  describe('GET /api/board-meetings', function() {
    it('should route to boardMeeting.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'boardMeetingCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/board-meetings/:id', function() {
    it('should route to boardMeeting.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'boardMeetingCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/board-meetings', function() {
    it('should route to boardMeeting.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'boardMeetingCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/board-meetings/:id', function() {
    it('should route to boardMeeting.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'boardMeetingCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/board-meetings/:id', function() {
    it('should route to boardMeeting.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'boardMeetingCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/board-meetings/:id', function() {
    it('should route to boardMeeting.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'boardMeetingCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
