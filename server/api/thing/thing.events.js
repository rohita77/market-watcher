/**
 * Thing model events
 */

'use strict';

const EventEmitter = require('events').EventEmitter;
const Thing = require('./thing.model');
var ThingEvents = new EventEmitter();

// Set max event listeners (0===unlimited)
ThingEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Thing.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    ThingEvents.emit(event + ':' + doc._id, doc);
    ThingEvents.emit(event, doc);
  }
}

module.exports = ThingEvents;
