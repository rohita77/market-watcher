/**
 * Symbol model events
 */

'use strict';

const EventEmitter = require('events').EventEmitter;

var SymbolEvents = new EventEmitter();

// Set max event listeners (0===unlimited)
SymbolEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Symbol) {
  for(var e in events) {
    let event = events[e];
    Symbol.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    SymbolEvents.emit(event + ':' + doc._id, doc);
    SymbolEvents.emit(event, doc);
  };
}

exports.default = SymbolEvents;
exports.registerEvents = registerEvents;
