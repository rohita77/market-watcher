'use strict';

import mongoose from 'mongoose';
import math from 'mathjs';

var QuoteDataSchema = new mongoose.Schema({
  symbol: { type: mongoose.Schema.Types.String, ref: 'Quote' },
  open: { type: Number, set: toNumber, default: 0.00 },
  high: { type: Number, set: toNumber, default: 0.00 },
  low: { type: Number, set: toNumber, default: 0.00 },
  ltP: { type: Number, set: toNumber, default: 0.00 },
  ptsC: { type: Number, set: toNumber, default: 0.00 },
  per: { type: Number, set: toNumber, default: 0.00 },
  trdVol: { type: Number, set: toNumber, default: 0.00 },
  trdVolM: { type: Number, set: toNumber, default: 0.00 },
  ntP: { type: Number, set: toNumber, default: 0.00 },
  mVal: { type: Number, set: toNumber, default: 0.00 },
  wkhi: { type: Number, set: toNumber, default: 0.00 },
  wklo: { type: Number, set: toNumber, default: 0.00 },
  wkhicm_adj: { type: Number, set: toNumber, default: 0.00 },
  wklocm_adj: { type: Number, set: toNumber, default: 0.00 },
  xDt: { type: Date, default: null },
  cAct: { type: String, default: null },
  yPC: { type: Number, set: toNumber, default: 0.00 },
  mPC: { type: Number, set: toNumber, default: 0.00 },
  expectedHigh: { type: Number},
  expectedLow: { type: Number},
  expectedHighPercent: { type: Number},
  expectedLowPercent: { type: Number},
  expectedHighCallROCPercent: { type: Number},
  expectedLowPutROCPercent: { type: Number},
  expectedHighOptions: {},
  expectedLowOptions: {},
  frontMonthLotSize: { type: Number, default: 0 }, //TD
  frontMonthMarginPercent: { type: Number, default: 0.15 }, //TD
}
);

QuoteDataSchema.pre('save', function (next) {
  this.frontMonthMargin = rnd(this.frontMonthMarginPercent * this.ltP, 0);
  this.expectedHighPercent = rnd(((this.expectedHigh - this.ltP) * 100) / this.ltP, 2);
  this.expectedLowPercent = rnd(((this.ltP - this.expectedLow) * 100) / this.ltP, 2);

  if (this.expectedHighOptions)
    this.expectedHighCallROCPercent = ((this.expectedHighOptions.call.midPrice * 100) / (this.frontMonthMarginPercent * this.ltP));
  if (this.expectedLowOptions)
    this.expectedLowPutROCPercent = ((this.expectedLowOptions.put.midPrice * 100) / (this.frontMonthMarginPercent * this.ltP));
  next()

})

var QuotesSchema = new mongoose.Schema({
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
    return v

}

let rnd = (v, n = 2) => math.round(v, n);

export default mongoose.model('Quote', QuotesSchema);

//Index on reresh time or last mod or quot time/
//If quote time is duplicate then skip

/*
db.quotes.findOne({})
db.quotes.find({ntp: {$gte : 100}}).count()

db.quotes.aggregate([
  { $sort: { refreshTime: - 1 } },
  { $limit: 1 },
  {
    $project: {
      refreshTime : true,
      quotes: {
        $filter: {
          input: "$quotes",
          as: "quote",
          cond: {
            $or: [
              { $gte: ["$$quote.trdVol", 40] }, //40 avg for 212 symbols. 6 trading hours
              { $gte: ["$$quote.ntP", 100] }, ////100 avg for 212 symbols
            ]
          }

        }
      }
    }
  },
  {
    $project : {
      refreshTime : true,
      "_id" : false,
      totalSymbols : {
        $size : '$quotes.symbol'
      },
      avgVol : {
        $avg : '$quotes.trdVol'
      },
      minVol : {
        $min : '$quotes.trdVol'
      },

      avgTurnover : {
        $avg : '$quotes.ntP'
      },
      minTurnover : {
        $min : '$quotes.ntP'
      },
      symbols : '$quotes.symbol1'
    }
  }
]
).pretty();

*/
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