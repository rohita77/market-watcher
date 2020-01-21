'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
const request = require('supertest');

var newDailyStat;

describe('DailyStat API:', function() {
  describe('GET /api/daily-stats', function() {
    var dailyStats;

    beforeEach(function(done) {
      request(app)
        .get('/api/daily-stats')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          dailyStats = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(dailyStats).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/daily-stats', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/daily-stats')
        .send({
          name: 'New DailyStat',
          info: 'This is the brand new dailyStat!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newDailyStat = res.body;
          done();
        });
    });

    it('should respond with the newly created dailyStat', function() {
      expect(newDailyStat.name).to.equal('New DailyStat');
      expect(newDailyStat.info).to.equal('This is the brand new dailyStat!!!');
    });
  });

  describe('GET /api/daily-stats/:id', function() {
    var dailyStat;

    beforeEach(function(done) {
      request(app)
        .get(`/api/daily-stats/${newDailyStat._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          dailyStat = res.body;
          done();
        });
    });

    afterEach(function() {
      dailyStat = {};
    });

    it('should respond with the requested dailyStat', function() {
      expect(dailyStat.name).to.equal('New DailyStat');
      expect(dailyStat.info).to.equal('This is the brand new dailyStat!!!');
    });
  });

  describe('PUT /api/daily-stats/:id', function() {
    var updatedDailyStat;

    beforeEach(function(done) {
      request(app)
        .put(`/api/daily-stats/${newDailyStat._id}`)
        .send({
          name: 'Updated DailyStat',
          info: 'This is the updated dailyStat!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedDailyStat = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedDailyStat = {};
    });

    it('should respond with the updated dailyStat', function() {
      expect(updatedDailyStat.name).to.equal('Updated DailyStat');
      expect(updatedDailyStat.info).to.equal('This is the updated dailyStat!!!');
    });

    it('should respond with the updated dailyStat on a subsequent GET', function(done) {
      request(app)
        .get(`/api/daily-stats/${newDailyStat._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let dailyStat = res.body;

          expect(dailyStat.name).to.equal('Updated DailyStat');
          expect(dailyStat.info).to.equal('This is the updated dailyStat!!!');

          done();
        });
    });
  });

  describe('PATCH /api/daily-stats/:id', function() {
    var patchedDailyStat;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/daily-stats/${newDailyStat._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched DailyStat' },
          { op: 'replace', path: '/info', value: 'This is the patched dailyStat!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedDailyStat = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedDailyStat = {};
    });

    it('should respond with the patched dailyStat', function() {
      expect(patchedDailyStat.name).to.equal('Patched DailyStat');
      expect(patchedDailyStat.info).to.equal('This is the patched dailyStat!!!');
    });
  });

  describe('DELETE /api/daily-stats/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/daily-stats/${newDailyStat._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when dailyStat does not exist', function(done) {
      request(app)
        .delete(`/api/daily-stats/${newDailyStat._id}`)
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
