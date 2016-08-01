/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/watchlists              ->  index
 * POST    /api/watchlists              ->  create
 * GET     /api/watchlists/:id          ->  show
 * PUT     /api/watchlists/:id          ->  update
 * DELETE  /api/watchlists/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Watchlist from './watchlist.model';

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
      return entity.remove()
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

function getSymbolsInWatchList(name) {
  //NSEAdapter.getSymbolsInIndex('Nifty50') --> {symbol,name,id,id, type}


  var request = require('request');

  var options = {
    url: 'https://www.nseindia.com/content/indices/ind_nifty50list.csv',
    headers: {
      'Host': 'www.nseindia.com',
      'Upgrade-Insecure-Requests': 1,
      'User-Agent': 'Mozilla/5.0(Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36(KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36',
      'Accept': 'application/csv,text/csv',
      'Accept-Encoding': 'gzip, deflate, sdch, br',
    }
  };

  //Converter Class
  var Converter = require("csvtojson").Converter;
  var converter = new Converter({ constructResult: true }); //for small csv data

  //end_parsed will be emitted once parsing finished
  var symbolsPromise = new Promise((resolve, reject) => {

    converter.on("end_parsed", function (jsonArray) {
      jsonArray;

      jsonArray.forEach(elem => {
        elem.name = elem['Company Name'];
        delete elem['Company Name'];
        elem.symbol = elem.Symbol;
        delete elem.Symbol;
        elem.industry = elem.Industry;
        delete elem.Industry;
        elem.id = elem['ISIN Code'];
        delete elem['ISIN Code'];

      });

      resolve(jsonArray);    //CB called from another CB?
      console.log('Found LT:' + jsonArray.find(symbol => { return symbol.symbol.match('\^LT$') }).symbol);
    });

    request.get(options).pipe(converter);


  });


  return symbolsPromise;
}


// Gets a list of Watchlists
export function index(req, res) {
  return Watchlist.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Watchlist from the DB
export function show(req, res) {

  //TD: Remove when symbols are stored in DB
  if (req.params.id === 'Nifty50') {

    var watchlist = {};
    watchlist.name = 'Nifty50';
    watchlist.active = true;
    watchlist.description = 'Some Index';

    getSymbolsInWatchList('Nifty50')
      .then(symbols => {
        watchlist.symbols = symbols;
        res.status(200).json(watchlist);
      });
  }
  else {
    return Watchlist.findById(req.params.id).exec()
      .then(handleEntityNotFound(res))
      .then(respondWithResult(res))
      .catch(handleError(res));
  }
}

// Creates a new Watchlist in the DB
export function create(req, res) {
  return Watchlist.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Watchlist in the DB
export function update(req, res) {
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
export function destroy(req, res) {
  return Watchlist.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
