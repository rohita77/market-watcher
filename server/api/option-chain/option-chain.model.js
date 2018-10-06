'use strict';

import mongoose from 'mongoose';
import { registerEvents } from './option-chain.events';
import math from 'mathjs';

var queries = require('./option-chain.queries');

let int = (n, k = 10) => Math.round(n * k) / k;
let rnd = (v, n = 2) => { return math.round(v, n) }

var OptionSchema = new mongoose.Schema({
  oi: { type: Number, default: 0.00 },
  chngInOI: { type: Number, default: 0.00 },  //TD: setter to convert to number
  vol: { type: Number, default: 0.00 },
  iv: { type: Number, default: 0.00 },
  ltp: { type: Number, default: 0.00 },
  netChng: { type: Number, default: 0.00 },
  bidQty: { type: Number, default: 0.00 },
  bid: { type: Number, default: 0.00 },
  ask: { type: Number, default: 0.00 },
  askQty: { type: Number, default: 0.00 },

  hi: { type: Number, default: 0.00 },
  lo: { type: Number, default: 0.00 },

  mid: { type: Number }, //TD: In default cannot reference another property
  bidAskSpr: { type: Number },
  perSpr: { type: Number },
  be: { type: Number, default: 0.00 },
  perChngInOI: { type: Number },

  perROC: { type: Number },
  bePerSpot: { type: Number },

})

//TD: Null Option if there is no oi or volume ?
OptionSchema.pre('save', function (next) {
  //  console.info("Inside Option Schema Save");
  this.mid = rnd((this.bid + this.ask) / 2);
  this.bidAskSpr = rnd((this.ask - this.bid));
  this.perSpr = rnd((this.bidAskSpr / this.ask) * 100);
  this.perChngInOI = rnd((this.chngInOI / (this.oi - this.chngInOI)) * 100);

  this.hi = math.max(this.hi, this.ltp);
  this.lo = math.min(this.lo || this.ltp , this.ltp);

  next()
})

var StrikeSchema = new mongoose.Schema({
  price: { type: Number },
  perSpot: { type: Number },
  call: OptionSchema,
  put: OptionSchema

})

var OptionChainSchema = new mongoose.Schema({
  symbol: String,           //TD: Sub docs expiry date, strike price, option
  expDt: String,            //TD: Date format
  quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote' },
  // quoteTime: Date, //TD
  spot: Number,
  mrgnPer: Number,
  lotSz: Number, //TD
  expDays: Number,
  //TD: expHi, expLo, etc.
  strikes: [StrikeSchema]
});

//TD: Get Rid of options wih no OI or volume
OptionChainSchema.pre('save', function (next) {

  let spot = this.spot;
  let mrgnPer = this.mrgnPer;

  this.strikes =
    this.strikes.filter(function (strike) {
      //    Save only options with any oi and volume
      if ((strike.call && strike.call.oi > 0 && strike.call.vol > 0 && strike.call.bid > 0) || (strike.put && strike.put.oi > 0 && strike.put.vol > 0 && strike.put.bid > 0)) {
        // console.log(`${strike.price}  ${spot} ${mrgnPer}`);

        strike.perSpot = (strike.price - spot) * 100 / (spot);
        strike.perSpot = rnd(strike.perSpot, 2);

        strike.call.be = strike.price + strike.call.mid;
        strike.call.be = rnd(strike.call.be, 2);

        strike.put.be = strike.price - strike.put.mid;
        strike.put.be = rnd(strike.put.be, 2);

        strike.call.perROC = (strike.call.mid * 100) / (mrgnPer * spot);
        strike.call.perROC = rnd(strike.call.perROC, 2);

        strike.put.perROC = (strike.put.mid * 100) / (mrgnPer * spot);
        strike.put.perROC = rnd(strike.put.perROC, 2);

        strike.call.bePerSpot = (strike.call.be - spot) * 100 / (spot);
        strike.call.bePerSpot = rnd(strike.call.bePerSpot, 2);

        strike.put.bePerSpot = (strike.put.be - spot) * 100 / (spot);
        strike.put.bePerSpot = rnd(strike.put.bePerSpot, 2);

        return strike;

      }

    }, this);

  if (this.strikes.length < 1)
    next(new Error("No Liquid Strikes"));
  else
    next();
})


OptionChainSchema.statics.getOptionChainSubsetForSymbol = function (symbol, ltP) {

  let pipeline = queries.getPiplelineForOCSubset(symbol, ltP);

  // log('***********************************************Pipeline***********************************************************************************');
  // log(`${JStr(pipeline)}  `);
  // log('*****************************************************************************************************************************************************');

  return this.aggregate(pipeline)

};

//******************************************* Test Wrapper ************************************************************/
let JStr = (s) => JSON.stringify(s);
let log = (s) => console.log(s);

let logCallOpt = (o) => logOpt(o, 'call');
let logPutOpt = (o) => logOpt(o, 'put');

function logOpt(o, t) {
  log(JStr(o));

  let n = {};
  [n.mid, n.bidAskSpr, n.perSpr, n.oi, n.chngInOI, n.perChngInOI, n.vol, n.iv, n.netChng] =

    [o[t].mid, o[t].bidAskSpr, o[t].perSpr, o[t].oi, o[t].chngInOI, o[t].perChngInOI, o[t].vol, o[t].iv, o[t].netChng];

  log(`SP: ${o.price} perSpot: ${o.perSpot} BE:${o[t].be} bePerSpot: ${o[t].bePerSpot} perROC: ${o[t].perROC} ${t}: ${JStr(n)}`);

}


OptionChainSchema.statics.test = function (params) {

  switch (params[0]) {
    case 'getOptionChainSubsetForSymbol':
      return this.getOptionChainSubsetForSymbol(params[1] || [], params[2] * 1.0)
        .exec()
        .then((docs, err) => {
          if (docs) {
            let arrRes = docs;

            arrRes.forEach((u) => {

              log('------------------------------------------------ Summary -----------------------------------------------------------------------------------------------');
              log(`${u.symbol} Spot: ${params[2]} Exp Hi: ${u.expHiHlfSD.price} Exp Lo: ${u.expLoHlfSD.price}  1SDExpHi: ${rnd(u.expHiOneSD.price, 2)} 1SDExpLo: ${rnd(u.expLoOneSD.price)}`);

              log('------------------------------------------------ ATM Options -----------------------------------------------------------------------------------------------');
              logCallOpt(u.ATMOption);
              logPutOpt(u.ATMOption);

              log('------------------------------------------------ NTM Options -----------------------------------------------------------------------------------------------');
              logCallOpt(u.NTMOption);
              logPutOpt(u.NTMOption);

              log('--------------------------------------------------- Half SD Expected High Call -----------------------------------------------------------------------------------------');

              let o;

              o = { call: u.expHiHlfSD.nextCall };
              logCallOpt(Object.assign(u.expHiHlfSD.nextStrike, o));

              log('--------------------------------------------------- Half SD Expected Low Put -------------------------------------------------------------------------------------------');

              o = { put: u.expLoHlfSD.nextPut };
              logPutOpt(Object.assign(u.expLoHlfSD.nextStrike, o));


              log('---------------------------------------------------  One SD Expected High Call -----------------------------------------------------------------------------------------');

              o = { call: u.expHiOneSD.nextCall };
              logCallOpt(Object.assign(u.expHiOneSD.nextStrike, o));

              log('--------------------------------------------------- One SD Expected Low Put --------------------------------------------------------------------------------------------');

              o = { put: u.expLoOneSD.nextPut };
              logPutOpt(Object.assign(u.expLoOneSD.nextStrike, o));


              log('--------------------------------------------------- CALLS above expHiHlfSD --------------------------------------------------------------------------------------------');
              u.strikesAboveExpectedHigh.forEach((s) => logCallOpt(s));

              log('--------------------------------------------------- CALLS above expHiOneSD --------------------------------------------------------------------------------------------');
              u.strikesAboveExpHiOneSD.forEach((s) => logCallOpt(s));

              log('--------------------------------------------------- PUTS below expLoHlfSD --------------------------------------------------------------------------------------------');
              u.strikesBelowExpectedLow.forEach((s) => logPutOpt(s));

              log('--------------------------------------------------- PUTS below expLoOneSD --------------------------------------------------------------------------------------------');
              u.strikesBelowExpLoOneSD.forEach((s) => logPutOpt(s));

            })

          }
        });
      break;
    default:
      break;
  }

  return


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