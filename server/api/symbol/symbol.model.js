'use strict';

import mongoose from 'mongoose';
import { registerEvents } from './symbol.events';

var SymbolSchema = new mongoose.Schema({
  _id: String,
  market: String,
  symbol: String,
  name: String,
  industry: String,
  watchlists: [String],
  nextEarnings: Date,
  forthComingBoardMeetings: [{
    boardMeetingDate: Date,
    purposes: [String]
  }]

});

registerEvents(SymbolSchema);
export default mongoose.model('Symbol', SymbolSchema);
