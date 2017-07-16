'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './board-meeting.events';

var BoardMeetingSchema = new mongoose.Schema({
    symbol: String,
    boardMeetingDate: Date,
    purpose: String,
});

registerEvents(BoardMeetingSchema);
export default mongoose.model('BoardMeeting', BoardMeetingSchema);

