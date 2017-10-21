'use strict';

import mongoose from 'mongoose';
import { registerEvents } from './symbol.events';
import math from 'mathjs';

var SymbolSchema = new mongoose.Schema({
  _id: String,
  market: String,
  symbol: String,
  name: String,
  industry: String,
  watchlists: [String],
  previousEarnings: { type: Date, default: null },
  nextEarnings: Date,
  projectedEarnings: Date,
  forthComingBoardMeetings: [{
    boardMeetingDate: Date,
    purposes: [String]
  }],
  frontMonthLotSize: { type: Number, default: 0 },
  frontMonthMarginPercent: { type: Number, default: 0.15 }, //TD
  nextEarningsBeforeFrontMonthExpiry: Boolean,
  nextEarningsBeforeBackMonthExpiry: Boolean,
  daysToEarnings: Number
});

let rnd = (v, n = 2) => math.round(v, n);

SymbolSchema.pre('save', function (next) {

  //TD: use moment
  //symbol.daysToEarnings = moment(symbol.projectedEarnings).diff(moment(), 'days');
  let MsInADay = 24 * 60 * 60 * 1000;
  this.daysToEarnings = Math.ceil((new Date(this.projectedEarnings) - (new Date())) / MsInADay);
  this.daysToEarnings = (this.daysToEarnings <= 0) ? undefined : this.daysToEarnings;
  next();
})

registerEvents(SymbolSchema);
export default mongoose.model('Symbol', SymbolSchema);

//*


//*/