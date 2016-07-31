'use strict';

var app = require('../..');
import request from 'supertest';

var newWatchlist;

describe('Watchlist API:', function() {

  describe('GET /api/watchlists', function() {
    var watchlists;

    beforeEach(function(done) {
      request(app)
        .get('/api/watchlists')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          watchlists = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(watchlists).to.be.instanceOf(Array);
    });

  });

  describe('POST /api/watchlists', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/watchlists')
        .send({
          name: 'New Watchlist',
          description: 'This is the brand new watchlist!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newWatchlist = res.body;
          done();
        });
    });

    it('should respond with the newly created watchlist', function() {
      expect(newWatchlist.name).to.equal('New Watchlist');
      expect(newWatchlist.description).to.equal('This is the brand new watchlist!!!');
    });

  });

  describe('GET /api/watchlists/:id', function() {
    var watchlist;

    beforeEach(function(done) {
      request(app)
        .get('/api/watchlists/' + newWatchlist._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          watchlist = res.body;
          done();
        });
    });

    afterEach(function() {
      watchlist = {};
    });

    it('should respond with the requested watchlist', function() {
      expect(watchlist.name).to.equal('New Watchlist');
      expect(watchlist.description).to.equal('This is the brand new watchlist!!!');
      expect(watchlist.symbols,'Return an array of symbols').to.be.instanceOf(Array);
    });

  });

  //Test for Nifty50??

  describe('PUT /api/watchlists/:id', function() {
    var updatedWatchlist;

    beforeEach(function(done) {
      request(app)
        .put('/api/watchlists/' + newWatchlist._id)
        .send({
          name: 'Updated Watchlist',
          description: 'This is the updated watchlist!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedWatchlist = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedWatchlist = {};
    });

    it('should respond with the updated watchlist', function() {
      expect(updatedWatchlist.name).to.equal('Updated Watchlist');
      expect(updatedWatchlist.description).to.equal('This is the updated watchlist!!!');
    });

  });

  describe('DELETE /api/watchlists/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/watchlists/' + newWatchlist._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when watchlist does not exist', function(done) {
      request(app)
        .delete('/api/watchlists/' + newWatchlist._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
