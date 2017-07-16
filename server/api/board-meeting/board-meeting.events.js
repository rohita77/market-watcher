/**
 * BoardMeeting model events
 */

'use strict';

import {EventEmitter} from 'events';
var BoardMeetingEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
BoardMeetingEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(BoardMeeting) {
  for(var e in events) {
    let event = events[e];
    BoardMeeting.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    BoardMeetingEvents.emit(event + ':' + doc._id, doc);
    BoardMeetingEvents.emit(event, doc);
  };
}

export {registerEvents};
export default BoardMeetingEvents;
