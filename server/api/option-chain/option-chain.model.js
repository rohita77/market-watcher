'use strict';

import mongoose from 'mongoose';
import { registerEvents } from './option-chain.events';
import math from 'mathjs';

var queries = require('./option-chain.queries');

var OptionSchema = new mongoose.Schema({
  oi: { type: Number, default: 0.00 },
  chngInOI: { type: Number, default: 0.00 },  //TD: setter to convert to number
  volume: { type: Number, default: 0.00 },
  iv: { type: Number, default: 0.00 },
  ltp: { type: Number, default: 0.00 },
  netChng: { type: Number, default: 0.00 },
  bidQty: { type: Number, default: 0.00 },
  bidPrice: { type: Number, default: 0.00 },
  askPrice: { type: Number, default: 0.00 },
  askQty: { type: Number, default: 0.00 },

  midPrice: { type: Number }, //TD: In default cannot reference another property
  bidAskSpread: { type: Number },
  percentSpread: { type: Number },
  breakEven: { type: Number, default: 0.00 },
  percentchngInOI: { type: Number },

})

//TD: Null Option if there is no oi or volume ?
OptionSchema.pre('save', function (next) {
  this.midPrice = rnd((this.bidPrice + this.askPrice) / 2);
  this.bidAskSpread = rnd((this.askPrice - this.bidPrice));
  this.percentSpread = rnd((this.bidAskSpread / this.askPrice) * 100);
  this.percentchngInOI = rnd((this.chngInOI / (this.oi - this.chngInOI)) * 100);

  next()
})

var OptionChainSchema = new mongoose.Schema({
  symbol: String,           //TD: Sub docs expiry date, strike price, option
  expiryDate: String,
  quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote' },
  strikes: [{
    strikePrice: { type: Number},
    call: OptionSchema,
    put: OptionSchema
  }]
});

//TD: Get Rid of options wih no OI or volume
OptionChainSchema.pre('save', function (next) {

  this.strikes =
  this.strikes.filter(function (strike) {
    strike.call.breakEven = rnd(strike.strikePrice + strike.call.midPrice);
    strike.put.breakEven = rnd(strike.strikePrice - strike.put.midPrice);

//    Save only options with any oi and volume
    if ((strike.call.oi > 0 && strike.call.volume > 0) || (strike.put.oi > 0 && strike.put.volume > 0))
      return strike;
  }, this);

  if (this.strikes.length <1)
    next (new Error("No Strikes"));
  else
    next();
})

// OptionChainSchema.post('save', function (error, doc, next) {
//   next();
// })

function rnd (v, n = 2) { return math.round(v, n) }

OptionChainSchema.statics.getOptionChainSubsetForSymbol = function (symbol, ltP) {

  let pipeline = queries.getPiplelineForOCSubset(symbol, ltP);

  return this.aggregate(pipeline)

};


registerEvents(OptionChainSchema);
export default mongoose.model('OptionChain', OptionChainSchema);



/*

%Expected vs %d, 30d, 365d
netChg increased by 10%
chngInOI increased by 10%
iv > 50

call roc
put roc

trading Holidays
margin
*/