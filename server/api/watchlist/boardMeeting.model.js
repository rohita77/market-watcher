'use strict';

import mongoose from 'mongoose';

var boardMeetingSchema = new mongoose.Schema({
  _id: {
    symbol: String,
    purpose: String,
    boardMeetingDate: Date,
  }
});

export default mongoose.model('boardMeeting', boardMeetingSchema);
