//node dist/server/batchApp.job

'use strict';
import _ from 'lodash';
import moment from 'moment';

//import NSEDataAdapter from '../../components/nsedata/downloads'; //TD:
var NSEDataAdapter = require('../../components/nse-data-adapter/index');

//import Model and save to Mongo
import Quote from './quote.model'
import OptionChain from '../../api/option-chain/option-chain.model'

export function run() {

  log('Quote Job Fired');
  return refreshStockQuotes()
    .then((quotesJSON) => {
      log(`Refreshed StockQuotes for Index: ${quotesJSON.index} id:${quotesJSON._id.toLocaleString('en-US', IST)} with ${quotesJSON.quotes.length} symbols and quoteTime: ${quotesJSON.quoteTime.toLocaleString('en-US', IST)}`)
      return quotesJSON;
    })
  //TS+D: Which one to get. The list is big
    .then((quotesJSON) => refreshOptionChains(quotesJSON))
    .then((quotesJSON) => {
      log(`Refreshed Option chains and updated in ${quotesJSON.quotes.length} quotes`);
      return quotesJSON;
    })
    .then((quotesJSON) => {
      log(`Saving quote for index ${quotesJSON.index} with id ${quotesJSON._id.toLocaleString('en-US', IST)}`)
      return quotesJSON.save();

    })
    .then((saved) => {
      log(`Saved quotes at:${saved.lastMod.toLocaleString()}`);
    });

}

let IST = { timeZone: 'Asia/Calcutta', timeZoneName: 'short' };

function now() {
  return moment().format('HH:mm:ss Z');
}

function log(message) {
  console.log(`${now()} ${message}`);
}

function refreshStockQuotes() {

  return NSEDataAdapter.getQuotesForFnOStocks()
  //save the quotes in the DB once they are downloaded
    .then(quotesJSON => {
      log(`Fetched Quotes for index: ${quotesJSON.index} with ${quotesJSON.quotes.length} symbols and quoteTime: ${quotesJSON.quoteTime.toLocaleString('en-US', IST)}`);

      return Quote.findOneAndUpdate({ _id: quotesJSON.quoteTime }, quotesJSON, { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true, runSettersOnQuery: true }).exec()
        .then((doc, err) => {
          log(`Upserted Quotes for index: ${quotesJSON.index} / with ${quotesJSON.quotes.length} symbols and quoteTime: ${quotesJSON.quoteTime.toLocaleString('en-US', IST)} and refreshTime: ${doc.refreshTime.toLocaleString()}`);
          if (err) log(err); //undefined
          return doc;
        });

    })
    //resolve the promise for the insert
}

function refreshOptionChains(quotesJSON) {
  let hoursFromOpen = moment().clone().utcOffset('+05:30').hour() - 9;
  hoursFromOpen = hoursFromOpen > 0 ? hoursFromOpen : 1;

  let frontMonthExpiry = NSEDataAdapter.getFrontMonthExpiryDate(moment(), 'DDMMMYYYY').toUpperCase();

  log(`Retrieving Option Chains for ${quotesJSON.quotes.length} symbols for ${frontMonthExpiry}`);

  //Promise for each stockQuote that is resolved when the Option Chain is retrieved and saved
  return Promise.all(
    quotesJSON.quotes.map(stockQuote => {
      //avgtrdVol: 40 lacs and avgTurnOver = 100 for 212 symbols for 6 trading hours
      if ((stockQuote.trdVol > (5 * hoursFromOpen)) || (stockQuote.ntP > (15 * hoursFromOpen))) { //TD Previous days value and from config
        //    if ((stockQuote.symbol == 'RELIANCE') || (stockQuote.symbol == 'HINDALCO')) {

        return refreshOptionChain(stockQuote, frontMonthExpiry)
          .then((oc) => getExpectedMoveForQuote(stockQuote))
      }
      else
        return stockQuote;
    }))
    .then((quotes) => {
      let qj = quotesJSON;
      qj.quotes = quotes;
      return qj;x
    })
}

/*
function refreshOptionChain(stockQuote, frontMonthExpiry) {

  return NSEDataAdapter.getStockOptionChain(stockQuote.symbol, frontMonthExpiry)
  //save the option chain in the DB once they are downloaded
    .then(async optionChainArr => {
      if (optionChainArr && optionChainArr.length > 0) {

        let optionChainJSON = {
          symbol: stockQuote.symbol,
          quoteId: stockQuote._id,
          expDt: frontMonthExpiry,    //TD: expiry date to date

          spot : stockQuote.ltP,
          mrgnPer: stockQuote.frMnthMrgnPer,
          // lotSz: Number, //TD
          expDays: NSEDataAdapter.getDaysToFrontMonthExpiry(),
          strikes: optionChainArr
        };

        log(`Fetched Option Chain for ${stockQuote.symbol}/ ${frontMonthExpiry} with ${optionChainArr.length} strikes and quoteTime: ${stockQuote.quoteTime}`);
*/
/*
        return OptionChain.findOneAndUpdate({ symbol: optionChainJSON.symbol, expDt: optionChainJSON.expDt }, optionChainJSON, { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true, runSettersOnQuery: true }).exec()
        .then((doc, err) => {
          if (err) log(`Error Creating Option Chain for ${optionChainJSON.symbol} / ${frontMonthExpiry}: ${err}`);
          return doc;
        })
        .catch((err) => {
          log(`Catch Error Creating Option Chain for ${optionChainJSON.symbol} / ${frontMonthExpiry}: ${err}`);
          return null;
        });
*/

/*
        let err
        let doc =   await OptionChain.create(optionChainJSON)
        console.log(`doc ${doc}`);
//          .then((doc,err) => {
            if (err) log(`Error Creating Option Chain for ${optionChainJSON.symbol} / ${frontMonthExpiry}: ${err}`);
            return doc;
  //        })
  /*
  .catch((err) => {
            log(`Error Creating Option Chain for ${stockQuote.symbol} / ${frontMonthExpiry}: ${err}`);
            return null;
          });
  */
//*/
/*
return oc;
        }
      else
        log(`No Option Chain Returned for ${stockQuote.symbol} for ${frontMonthExpiry} `);
      //TD: Return Promise?

    })

}
*/

async function refreshOptionChain(stockQuote, frontMonthExpiry) {

  let optionChainArr = await NSEDataAdapter.getStockOptionChain(stockQuote.symbol, frontMonthExpiry);

  if (!optionChainArr && optionChainArr.length <= 0)
    log(`No Option Chain returned for ${stockQuote.symbol} for ${frontMonthExpiry} `);
    //TD: Return Promise?
  else {

    log(`Fetched Option Chain for ${stockQuote.symbol}/ ${frontMonthExpiry} with ${optionChainArr.length} strikes and quoteTime: ${stockQuote.quoteTime}`);


    //Check if option chain alread exists in DB TD: Use a better primary key
    let optionChainDoc = await OptionChain.findOneAndRemove({
        symbol: stockQuote.symbol, expDt: frontMonthExpiry /*, quoteId:stockQuote._id ,*/
    })

    //if optionChainDoc //Merge
    //TD: find new hi/lo for e
    //Merge strikes

    //save the option chain in the DB once they are downloaded
    let optionChainJSON = {
      symbol: stockQuote.symbol,
      quoteId: stockQuote._id,
      expDt: frontMonthExpiry,    //TD: expiry date to date

      spot: stockQuote.ltP,
      mrgnPer: stockQuote.frMnthMrgnPer,
  //  lotSz: Number, //TD
      expDays: NSEDataAdapter.getDaysToFrontMonthExpiry(),
      strikes: optionChainArr
    };

    optionChainDoc = await OptionChain.create(optionChainJSON)
      .catch(
        err =>log(`Error Creating Option Chain for ${optionChainJSON.symbol} / ${frontMonthExpiry}: ${err}`)
      )

    return optionChainDoc;
  }

}

function getExpectedMoveForQuote(stockQuote) {

  //Get Expected High and Low and options at High and Low Symbol
  //TD: pass quoteId
  return OptionChain.getOptionChainSubsetForSymbol(stockQuote.symbol, stockQuote.ltP)
    .exec()
    .then((docs, err) => docs[0] ? docs[0] : {})
    .then((expOC) => {
      let o = stockQuote;
      ({
        expectedHigh: o.expectedHigh,
        expectedLow: o.expectedLow,
        expectedHighOptions: o.expectedHighOptions,
        expectedLowOptions: o.expectedLowOptions,
        expHiHlfSD : o.expHiHlfSD,
        expLoHlfSD : o.expLoHlfSD,
        expHiOneSD : o.expHiOneSD,
        expLoOneSD : o.expLoOneSD,
      } = expOC);

      log(`Stock ${stockQuote.symbol} has expected high/low as ${stockQuote.expectedHigh}/${stockQuote.expectedLow}`)
      return stockQuote
    })
  DailyAverageQuotes
}