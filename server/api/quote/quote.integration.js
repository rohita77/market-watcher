'use strict';

var app = require('../..');
const request = require('supertest');

var newQuote;

describe('Quote API:', function() {

  describe('GET /api/quotes', function() {
    var quotes;

    beforeEach(function(done) {
      request(app)
        .get('/api/quotes')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          quotes = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(quotes).to.be.instanceOf(Array);
    });

  });

  describe('POST /api/quotes', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/quotes')
        .send({
          name: 'New Quote',
          info: 'This is the brand new quote!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newQuote = res.body;
          done();
        });
    });

    it('should respond with the newly created quote', function() {
      expect(newQuote.name).to.equal('New Quote');
      expect(newQuote.info).to.equal('This is the brand new quote!!!');
    });

  });

  describe('GET /api/quotes/:id', function() {
    var quote;

    beforeEach(function(done) {
      request(app)
        .get('/api/quotes/' + newQuote._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          quote = res.body;
          done();
        });
    });

    afterEach(function() {
      quote = {};
    });

    it('should respond with the requested quote', function() {
      expect(quote.name).to.equal('New Quote');
      expect(quote.info).to.equal('This is the brand new quote!!!');
    });

  });

  describe('PUT /api/quotes/:id', function() {
    var updatedQuote;

    beforeEach(function(done) {
      request(app)
        .put('/api/quotes/' + newQuote._id)
        .send({
          name: 'Updated Quote',
          info: 'This is the updated quote!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedQuote = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedQuote = {};
    });

    it('should respond with the updated quote', function() {
      expect(updatedQuote.name).to.equal('Updated Quote');
      expect(updatedQuote.info).to.equal('This is the updated quote!!!');
    });

  });

  describe('DELETE /api/quotes/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/quotes/' + newQuote._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when quote does not exist', function(done) {
      request(app)
        .delete('/api/quotes/' + newQuote._id)
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
