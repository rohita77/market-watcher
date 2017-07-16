'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newBoardMeeting;

describe('BoardMeeting API:', function() {
  describe('GET /api/board-meetings', function() {
    var boardMeetings;

    beforeEach(function(done) {
      request(app)
        .get('/api/board-meetings')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          boardMeetings = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(boardMeetings).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/board-meetings', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/board-meetings')
        .send({
          name: 'New BoardMeeting',
          info: 'This is the brand new boardMeeting!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newBoardMeeting = res.body;
          done();
        });
    });

    it('should respond with the newly created boardMeeting', function() {
      expect(newBoardMeeting.name).to.equal('New BoardMeeting');
      expect(newBoardMeeting.info).to.equal('This is the brand new boardMeeting!!!');
    });
  });

  describe('GET /api/board-meetings/:id', function() {
    var boardMeeting;

    beforeEach(function(done) {
      request(app)
        .get(`/api/board-meetings/${newBoardMeeting._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          boardMeeting = res.body;
          done();
        });
    });

    afterEach(function() {
      boardMeeting = {};
    });

    it('should respond with the requested boardMeeting', function() {
      expect(boardMeeting.name).to.equal('New BoardMeeting');
      expect(boardMeeting.info).to.equal('This is the brand new boardMeeting!!!');
    });
  });

  describe('PUT /api/board-meetings/:id', function() {
    var updatedBoardMeeting;

    beforeEach(function(done) {
      request(app)
        .put(`/api/board-meetings/${newBoardMeeting._id}`)
        .send({
          name: 'Updated BoardMeeting',
          info: 'This is the updated boardMeeting!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedBoardMeeting = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedBoardMeeting = {};
    });

    it('should respond with the updated boardMeeting', function() {
      expect(updatedBoardMeeting.name).to.equal('Updated BoardMeeting');
      expect(updatedBoardMeeting.info).to.equal('This is the updated boardMeeting!!!');
    });

    it('should respond with the updated boardMeeting on a subsequent GET', function(done) {
      request(app)
        .get(`/api/board-meetings/${newBoardMeeting._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let boardMeeting = res.body;

          expect(boardMeeting.name).to.equal('Updated BoardMeeting');
          expect(boardMeeting.info).to.equal('This is the updated boardMeeting!!!');

          done();
        });
    });
  });

  describe('PATCH /api/board-meetings/:id', function() {
    var patchedBoardMeeting;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/board-meetings/${newBoardMeeting._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched BoardMeeting' },
          { op: 'replace', path: '/info', value: 'This is the patched boardMeeting!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedBoardMeeting = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedBoardMeeting = {};
    });

    it('should respond with the patched boardMeeting', function() {
      expect(patchedBoardMeeting.name).to.equal('Patched BoardMeeting');
      expect(patchedBoardMeeting.info).to.equal('This is the patched boardMeeting!!!');
    });
  });

  describe('DELETE /api/board-meetings/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/board-meetings/${newBoardMeeting._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when boardMeeting does not exist', function(done) {
      request(app)
        .delete(`/api/board-meetings/${newBoardMeeting._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
