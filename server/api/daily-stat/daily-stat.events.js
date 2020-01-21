/**
 * DailyStat model events
 */

'use strict';

const EventEmitter = require('events').EventEmitter;
var DailyStatEvents = new EventEmitter();

// Set max event listeners (0===unlimited)
DailyStatEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(DailyStat) {
  for(var e in events) {
    let event = events[e];
    DailyStat.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    DailyStatEvents.emit(event + ':' + doc._id, doc);
    DailyStatEvents.emit(event, doc);
  };
}

exports.registerEvents = registerEvents;
exports.default = DailyStatEvents;
