/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/quotes              ->  index
 * POST    /api/quotes              ->  create
 * GET     /api/quotes/:id          ->  show
 * PUT     /api/quotes/:id          ->  update
 * DELETE  /api/quotes/:id          ->  destroy
 */

'use strict';

const _ = require('lodash');
const Quote = require('./quote.model');
const stub = require('./quote.stub');
const request = require('request-json');

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
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

// Gets a list of Quotes
exports.index=(req, res)  =>{

  var client = request.createClient('https://www.nseindia.com/live_market/dynaContent/live_watch/stock_watch/');

  client.get('niftyStockWatch.json', (error, response, body) => {
    if (!error && response.statusCode === 200) {
      body.time = new Date(body.time + ' GMT+0530');
      body.refreshtime = new Date();
      console.log('Number of Quotes: ' + body.data.length + " as of " + body.time.toLocaleTimeString("en-US", {timeZone:"Asia/Calcutta", timeZoneName:"short"})  + " retrieved at "  + body.refreshtime.toLocaleTimeString("en-US", {timeZone:"Asia/Singapore", timeZoneName:"short"}) );
      return res.json(body);
    }
/*
  return Quote.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
*/

});

}

// Gets a single Quote from the DB
exports.show=(req, res) =>{

  //  return res.sendFile(__dirname + '/' + req.params.id + '.stub.json');
  var client = request.createClient('https://www.nseindia.com/live_market/dynaContent/live_watch/stock_watch/');

  client.get('niftyStockWatch.json', (error, response, body) => {
    if (!error && response.statusCode === 200) {
      body.time = new Date(body.time + ' GMT+0530');
      body.refreshtime = new Date();
      console.log('Number of Quotes: ' + body.data.length + " as of " + body.time.toLocaleTimeString("en-US", {timeZone:"Asia/Calcutta", timeZoneName:"short"})  + " retrieved at "  + body.refreshtime.toLocaleTimeString("en-US", {timeZone:"Asia/Singapore", timeZoneName:"short"}) );
      return res.json(body);
    }
  })

  /*
   console.log("Number of Quotes: " + stub.niftyStockWatch.data.length);
    return res.json(stub.niftyStockWatch);

    return Quote.findById(req.params.id).exec()
      .then(handleEntityNotFound(res))
      .then(respondWithResult(res))
      .catch(handleError(res));
  */
}

// Creates a new Quote in the DB
exports.create=(req, res) =>{
  return Quote.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Quote in the DB
exports.update=(req, res) => {
  if (req.body._id) {
    delete req.body._id;
  }
  return Quote.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

//Deletes a Quote from the DB
exports.destroy = (req, res) => {
  return Quote.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
