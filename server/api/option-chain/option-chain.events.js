/**
 * OptionChain model events
 */

'use strict';

const EventEmitter = require('events').EventEmitter;
var OptionChainEvents = new EventEmitter();

// Set max event listeners (0===unlimited)
OptionChainEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(OptionChain) {
  for(var e in events) {
    let event = events[e];
    OptionChain.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    OptionChainEvents.emit(event + ':' + doc._id, doc);
    OptionChainEvents.emit(event, doc);
  };
}

exports.registerEvents = registerEvents;
exports.OptionChainEvents = OptionChainEvents;
