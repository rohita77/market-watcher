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
  previousEarnings: {type: Date, default:null},
  nextEarnings: Date,
  projectedEarnings: Date,
  forthComingBoardMeetings: [{
    boardMeetingDate: Date,
    purposes: [String]
  }],
  frontMonthLotSize: {type : Number, default : 0},
  frontMonthMarginPercent: {type : Number, default : 0.15}, //TD
});

let rnd = (v,n=2) => math.round(v, n);

registerEvents(SymbolSchema);
export default mongoose.model('Symbol', SymbolSchema);

//*


//*/