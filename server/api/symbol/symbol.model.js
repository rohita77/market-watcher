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
  previousEarnings: Date,
  nextEarnings: Date,
  projectedEarnings: Date,
  forthComingBoardMeetings: [{
    boardMeetingDate: Date,
    purposes: [String]
  }],
  frontMonthlotSize: {type : Number, default : 0},
  frontMonthMarginPercent: {type : Number, default : 0.15},
  NTMCallROCPercent: {type : Number, default : 0.05},
  NTMPutROCPercent: {type : Number, default : 0.05},
  callBreakEven: {type : Number, default : 0.00},
  putBreakEven: {type : Number, default : 0.00}
});

registerEvents(SymbolSchema);
export default mongoose.model('Symbol', SymbolSchema);
