'use strict';

import mongoose from 'mongoose';
import math from 'mathjs';

var queries = require('./quote.queries');

var QuoteDataSchema = new mongoose.Schema({
  symbol: { type: mongoose.Schema.Types.String, ref: 'Quote' },
  open: { type: Number, set: toNumber, default: 0.00 },
  high: { type: Number, set: toNumber, default: 0.00 },
  low: { type: Number, set: toNumber, default: 0.00 },
  ltP: { type: Number, set: toNumber, default: 0.00 },
  ptsC: { type: Number, set: toNumber, default: 0.00 },
  per: { type: Number, set: toNumber, default: 0.00 },
  trdVol: { type: Number, set: toNumber, default: 0.00 },
//  trdVolM: { type: Number, set: toNumber, default: 0.00 },
  ntP: { type: Number, set: toNumber, default: 0.00 },
//  mVal: { type: Number, set: toNumber, default: 0.00 },
  wkhi: { type: Number, set: toNumber, default: 0.00 },
  wklo: { type: Number, set: toNumber, default: 0.00 },
  // wkhicm_adj: { type: Number, set: toNumber, default: 0.00 },
  // wklocm_adj: { type: Number, set: toNumber, default: 0.00 },
  xDt: { type: Date, default: null },
  cAct: { type: String, default: null },
  yPC: { type: Number, set: toNumber, default: 0.00 },
  mPC: { type: Number, set: toNumber, default: 0.00 },

  expectedHigh: { type: Number },
  expectedLow: { type: Number },
  expectedHighPercent: { type: Number },
  expectedLowPercent: { type: Number },
  expectedHighCallROCPercent: { type: Number },
  expectedLowPutROCPercent: { type: Number },
  expectedHighOptions: {},
  expectedLowOptions: {},
  frontMonthMarginPercent: { type: Number, default: 0.15 }, //TD  remove or lookup from Symbol
  maxROC: { type: Number, default: 0 }, //TD
}
);

QuoteDataSchema.pre('save', function (next) {
  this.frontMonthMargin = rnd(this.frontMonthMarginPercent * this.ltP, 0);
  this.expectedHighPercent = rnd(((this.expectedHigh - this.ltP) * 100) / this.ltP, 2);
  this.expectedLowPercent = rnd(((this.ltP - this.expectedLow) * 100) / this.ltP, 2);

  if (this.expectedHighOptions) {
    this.expectedHighCallROCPercent = ((this.expectedHighOptions.call.midPrice * 100) / (this.frontMonthMarginPercent * this.ltP));
    this.expectedHighCallROCPercent = rnd(this.expectedHighCallROCPercent,2);
  }
  if (this.expectedLowOptions) {
    this.expectedLowPutROCPercent = ((this.expectedLowOptions.put.midPrice * 100) / (this.frontMonthMarginPercent * this.ltP));
    this.expectedLowPutROCPercent = rnd(this.expectedLowPutROCPercent,2);
  }

  //Max ROC for ranking and analytics
  let callROC = 0, putROC = 0;

  if (+this.expectedHighPercent > 0 && this.expectedHighOptions) {
    callROC = (+this.expectedHighOptions.call.percentSpread < 11) ? +this.expectedHighCallROCPercent || 0 : 0;
  }

  if (+this.expectedLowPercent > 0 && this.expectedLowOptions) {
    putROC = (+this.expectedLowOptions.put.percentSpread < 11) ? +this.expectedLowPutROCPercent || 0 : 0;
  }


  this.maxROC = math.max(+callROC || 0, +putROC || 0);
  this.maxROC = rnd(this.maxROC,2);


  next();


});

var QuotesSchema = new mongoose.Schema({
  _id: Date,
  index: String,
  quoteTime: { type: Date, default: null },
  refreshTime: { type: Date, default: null },
  quotes: [QuoteDataSchema]
});

function toNumber(v) {
  if (isNaN(v)) {
    let cleanStr = v.trim().replace(/,/g, '');
    return isNaN(+cleanStr) ? 0 : +cleanStr;
  }
  else
    return v;

}

function rnd (v, n = 2) { return math.round(v, n); }

    // let pipeline = getPipelineForDailvAverageQuotes(['INFY', "M&M", 'RELIANCE'], "20171208");
QuotesSchema.statics.getDailyQuoteStats = function (symbols,marketQuoteDate) {

  let pipeline = queries.getPipelineForDailyAverageQuotes(symbols,marketQuoteDate);
  console.log(JSON.stringify(pipeline));
  return this.aggregate(pipeline);

};



export default mongoose.model('Quote', QuotesSchema);

//Index on reresh time or last mod or quot time/
//If quote time is duplicate then skip

/*
db.quotes.findOne({})
db.quotes.find({ntp: {$gte : 100}}).count()


//*/
/*
var project = {"_id":"false","quotes.symbol":"true","quotes.expectedHighPercent":"true"};

var query = {
  "quotes": {
    "$not": {
      "$elemMatch": {
        "expectedHighPercent": { "$gt": 0 }
      }
    }
  }
};


var query = {
        "quotes.expectedHighPercent" :  {
          "$not": {
               "$gt": "0" }
    }
};

//db.quotes.findOne({'quotes.expectedHighPercent' : {$not : {$ne :0}}} ,project);

db.quotes.findOne(query ,project);

*/

/*
filter symbols with no earnings
filter symbols with daily average volume
  group by date
filter symbols with quotes having expected high percent

volume,roc,bidask,iv,oi,option vol,30day chg,

by DTE,
  average volume,roc,bidask,iv,oi,option vol,chg, 30day chg,

by hour of the day
  average roc,bidask,iv,oi,option vol,chg,30day chg,

by symbol
    days to 30%, 40%, 50%, 60%
    breach break even before expiry
    breach break even before expiry
    2X, 3X premium
    breach break even 50%
    max loss

h,l,c,o, price of closed option, last quotetimes, first modified date,iv,oi,vol

*/