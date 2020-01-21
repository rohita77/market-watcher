/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/board-meetings              ->  index
 * POST    /api/board-meetings              ->  create
 * GET     /api/board-meetings/:id          ->  show
 * PUT     /api/board-meetings/:id          ->  upsert
 * PATCH   /api/board-meetings/:id          ->  patch
 * DELETE  /api/board-meetings/:id          ->  destroy
 */

'use strict';

const jsonpatch = require('fast-json-patch');
const BoardMeeting = require('./board-meeting.model');
function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json({data : entity});
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

// Gets a list of BoardMeetings
exports.index=(req, res) =>{

  let query = {};

  if (req.query.tgtDate) {

    let tgtDateString = req.query.tgtDate;
    let tgtDateIST = new Date(tgtDateString + ' GMT+0530');
    if (tgtDateIST.getDay > 4)
      tgtDateIST.setDate(tgtDateIST.getDate() + 3); //Next Tuesday
    else
      tgtDateIST.setDate(tgtDateIST.getDate() + 1); //Tomorrow

    query.boardMeetingDate = { $lte: tgtDateIST };

  }

  if (req.query.watchlists)
    query.watchlists = req.query.watchlists;
  else
    query.watchlists = 'NIFTY200'; //Change to part of valid watch list $size > 0 or Regex [*]



  let project = { _id: 0, __v: 0};
  let sort = { boardMeetingDate: 1 };

  return BoardMeeting.find(query, project).sort(sort).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single BoardMeeting from the DB
exports.show=(req, res) =>{
  return BoardMeeting.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new BoardMeeting in the DB
exports.create=(req, res) =>{
  return BoardMeeting.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given BoardMeeting in the DB at the specified ID
exports.upsert=(req, res) =>{
  if (req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return BoardMeeting.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing BoardMeeting in the DB
exports.patch=(req, res) =>{
  if (req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return BoardMeeting.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a BoardMeeting from the DB
exports.destroy=(req, res) =>{
  return BoardMeeting.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
