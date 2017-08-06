'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newSymbol;

describe('Symbol API:', function() {
  describe('GET /api/symbols', function() {
    var symbols;

    beforeEach(function(done) {
      request(app)
        .get('/api/symbols')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          symbols = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(symbols).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/symbols', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/symbols')
        .send({
          name: 'New Symbol',
          info: 'This is the brand new symbol!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newSymbol = res.body;
          done();
        });
    });

    it('should respond with the newly created symbol', function() {
      expect(newSymbol.name).to.equal('New Symbol');
      expect(newSymbol.info).to.equal('This is the brand new symbol!!!');
    });
  });

  describe('GET /api/symbols/:id', function() {
    var symbol;

    beforeEach(function(done) {
      request(app)
        .get(`/api/symbols/${newSymbol._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          symbol = res.body;
          done();
        });
    });

    afterEach(function() {
      symbol = {};
    });

    it('should respond with the requested symbol', function() {
      expect(symbol.name).to.equal('New Symbol');
      expect(symbol.info).to.equal('This is the brand new symbol!!!');
    });
  });

  describe('PUT /api/symbols/:id', function() {
    var updatedSymbol;

    beforeEach(function(done) {
      request(app)
        .put(`/api/symbols/${newSymbol._id}`)
        .send({
          name: 'Updated Symbol',
          info: 'This is the updated symbol!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedSymbol = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedSymbol = {};
    });

    it('should respond with the updated symbol', function() {
      expect(updatedSymbol.name).to.equal('Updated Symbol');
      expect(updatedSymbol.info).to.equal('This is the updated symbol!!!');
    });

    it('should respond with the updated symbol on a subsequent GET', function(done) {
      request(app)
        .get(`/api/symbols/${newSymbol._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let symbol = res.body;

          expect(symbol.name).to.equal('Updated Symbol');
          expect(symbol.info).to.equal('This is the updated symbol!!!');

          done();
        });
    });
  });

  describe('PATCH /api/symbols/:id', function() {
    var patchedSymbol;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/symbols/${newSymbol._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Symbol' },
          { op: 'replace', path: '/info', value: 'This is the patched symbol!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedSymbol = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedSymbol = {};
    });

    it('should respond with the patched symbol', function() {
      expect(patchedSymbol.name).to.equal('Patched Symbol');
      expect(patchedSymbol.info).to.equal('This is the patched symbol!!!');
    });
  });

  describe('DELETE /api/symbols/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/symbols/${newSymbol._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when symbol does not exist', function(done) {
      request(app)
        .delete(`/api/symbols/${newSymbol._id}`)
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
