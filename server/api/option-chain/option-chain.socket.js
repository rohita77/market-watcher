/**
 * Broadcast updates to client when the model changes
 */

'use strict';

const OptionChainEvents = require('./option-chain.events');
// Model events to emit
var events = ['save', 'remove'];

exports.register=(socket)=> {
  // Bind model events to socket events
  for(var i = 0, eventsLength = events.length; i < eventsLength; i++) {
    var event = events[i];
    var listener = createListener(`optionChain:${event}`, socket);

    OptionChainEvents.on(event, listener);
    socket.on('disconnect', removeListener(event, listener));
  }
}


function createListener(event, socket) {
  return function(doc) {
    socket.emit(event, doc);
  };
}

function removeListener(event, listener) {
  return function() {
    OptionChainEvents.removeListener(event, listener);
  };
}
