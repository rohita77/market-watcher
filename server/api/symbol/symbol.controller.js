/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/symbols              ->  index
 * POST    /api/symbols              ->  create
 * GET     /api/symbols/:id          ->  show
 * PUT     /api/symbols/:id          ->  upsert
 * PATCH   /api/symbols/:id          ->  patch
 * DELETE  /api/symbols/:id          ->  destroy
 */

'use strict';

const jsonpatch = require('fast-json-patch');
const Symbol = require('./symbol.model');
const moment = require('moment');
function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json({ data: entity });
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function (entity) {
    try {
      // eslint-disable-next-line prefer-reflect
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch (err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.deleteMany()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Symbols
exports.index=(req, res)  =>{

  let query = {};
  query = (req.query.watchlists) ? {watchlists : req.query.watchlists } : {} ;
  //TD: query.watchlists.$in = req.query.watchlists;
  return Symbol.find(query).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Symbol from the DB
exports.show=(req, res) =>{
  return Symbol.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Symbol in the DB
exports.create=(req, res) =>{
  return Symbol.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Symbol in the DB at the specified ID
exports.upsert=(req, res) => {
  if (req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Symbol.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Symbol in the DB
exports.patch=(req, res) =>{
  if (req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Symbol.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Symbol from the DB
exports.destroy=(req, res) => {
  return Symbol.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
