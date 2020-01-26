/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/watchlists              ->  index
 * POST    /api/watchlists              ->  create
 * GET     /api/watchlists/:id          ->  show
 * PUT     /api/watchlists/:id          ->  update
 * DELETE  /api/watchlists/:id          ->  destroy
 */

'use strict';

const _ = require('lodash');
const Watchlist = require('./watchlist.model');
const watchlistJob = require('./watchlist.job');

exports.runWatchlistJob = async (req, res) => {
  let stream = await watchlistJob.run()
  await streamResults(res, stream);
  // .then(respondWithResult(res))
  // .catch(handleError(res));

}


function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json({
        data: entity
      });
    }
    return null;
  };
}

function streamResults(res, stream, statusCode) {
  statusCode = statusCode || 200;

  res.writeHead(200, {
    'Content-Type': 'text/json',
    'Transfer-Encoding': 'chunked'
  })

  if (stream) {

    stream.on('data', (data) => {
      res.write(JSON.stringify(data) + '\n');
    })

    stream.on('close', () => {
      console.log('Watchlist Job finished Asta La Vista Baby!');

      res.end()
    })

  }
  return null;
}


function saveUpdates(updates) {
  return function (entity) {
    var updated = _.merge(entity, updates);
    return updated.save()
      .then(updated => {
        return updated;
      });
  };
}

exports.saveUpdates = saveUpdates;


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

// Gets a list of Watchlists
exports.index = (req, res) => {
  return Watchlist.find({}, {
      name: true
    }).sort({
      name: 1
    }).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Watchlist from the DB
exports.show = (req, res) => {

  console.log(`Watchlist Param is ${req.params.id}`);
  return Watchlist.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Watchlist in the DB
exports.create = (req, res) => {
  return Watchlist.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Watchlist in the DB
exports.update = (req, res) => {
  if (req.body._id) {
    delete req.body._id;
  }
  return Watchlist.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Watchlist from the DB
exports.destroy = (req, res) => {
  return Watchlist.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
