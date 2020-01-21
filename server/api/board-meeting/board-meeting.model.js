'use strict';

const mongoose = require('mongoose');
const registerEvents = require('./board-meeting.events').registerEvents;
var BoardMeetingSchema = new mongoose.Schema({
  symbol: String,
  boardMeetingDate: Date,
  purpose: String,
  watchlists: [String]
});

registerEvents(BoardMeetingSchema);
module.exports = mongoose.model('BoardMeeting', BoardMeetingSchema);

