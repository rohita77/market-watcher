'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
const request = require('supertest');

var newOptionChain;

describe('OptionChain API:', function() {
  describe('GET /y', function() {
    var optionChains;

    beforeEach(function(done) {
      request(app)
        .get('/y')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          optionChains = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(optionChains).to.be.instanceOf(Array);
    });
  });

  describe('POST /y', function() {
    beforeEach(function(done) {
      request(app)
        .post('/y')
        .send({
          name: 'New OptionChain',
          info: 'This is the brand new optionChain!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newOptionChain = res.body;
          done();
        });
    });

    it('should respond with the newly created optionChain', function() {
      expect(newOptionChain.name).to.equal('New OptionChain');
      expect(newOptionChain.info).to.equal('This is the brand new optionChain!!!');
    });
  });

  describe('GET /y/:id', function() {
    var optionChain;

    beforeEach(function(done) {
      request(app)
        .get(`/y/${newOptionChain._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          optionChain = res.body;
          done();
        });
    });

    afterEach(function() {
      optionChain = {};
    });

    it('should respond with the requested optionChain', function() {
      expect(optionChain.name).to.equal('New OptionChain');
      expect(optionChain.info).to.equal('This is the brand new optionChain!!!');
    });
  });

  describe('PUT /y/:id', function() {
    var updatedOptionChain;

    beforeEach(function(done) {
      request(app)
        .put(`/y/${newOptionChain._id}`)
        .send({
          name: 'Updated OptionChain',
          info: 'This is the updated optionChain!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedOptionChain = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedOptionChain = {};
    });

    it('should respond with the updated optionChain', function() {
      expect(updatedOptionChain.name).to.equal('Updated OptionChain');
      expect(updatedOptionChain.info).to.equal('This is the updated optionChain!!!');
    });

    it('should respond with the updated optionChain on a subsequent GET', function(done) {
      request(app)
        .get(`/y/${newOptionChain._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let optionChain = res.body;

          expect(optionChain.name).to.equal('Updated OptionChain');
          expect(optionChain.info).to.equal('This is the updated optionChain!!!');

          done();
        });
    });
  });

  describe('PATCH /y/:id', function() {
    var patchedOptionChain;

    beforeEach(function(done) {
      request(app)
        .patch(`/y/${newOptionChain._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched OptionChain' },
          { op: 'replace', path: '/info', value: 'This is the patched optionChain!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedOptionChain = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedOptionChain = {};
    });

    it('should respond with the patched optionChain', function() {
      expect(patchedOptionChain.name).to.equal('Patched OptionChain');
      expect(patchedOptionChain.info).to.equal('This is the patched optionChain!!!');
    });
  });

  describe('DELETE /y/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/y/${newOptionChain._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when optionChain does not exist', function(done) {
      request(app)
        .delete(`/y/${newOptionChain._id}`)
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
