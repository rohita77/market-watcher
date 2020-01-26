//node dist/server/batchApp.job

'use strict';
const _ = require('lodash');
const moment = require('moment');
const jsonpatch = require('fast-json-patch');
//import NSEDataAdapter from '../../components/nsedata/downloads'; //TD:
var NSEDataAdapter = require('../../components/nse-data-adapter/index');

//import Model and save to Mongo
const Quote = require('./quote.model');
const OptionChain = require('../../api/option-chain/option-chain.model');

function chunk(array, size) {
  const chunked_arr = [];
  let index = 0;
  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }
  return chunked_arr;
}

let IST = {
  timeZone: 'Asia/Calcutta',
  timeZoneName: 'short'
};

const Readable = require('stream').Readable
const stream = new Readable({
  objectMode: true,
  read() {},
  autoDestroy: true
})

function now() {
  return moment().format('HH:mm:ss Z');
}

function log(message) {

  console.log(`${now()} ${message}`);
  let json = {}
  json[`${now()}`] = `${message}`
  if (stream.readableFlowing) stream.push(json);
}

async function runJob() {
  {
    log('Quote Job Fired');
    let quotesJSON = await refreshStockQuotes();
    log(`Refreshed StockQuotes for Index: ${quotesJSON.index} id:${quotesJSON._id.toLocaleString('en-US', IST)} with ${quotesJSON.quotes.length} symbols and quoteTime: ${quotesJSON.quoteTime.toLocaleString('en-US', IST)}`);
    quotesJSON = await refreshOptionChains(quotesJSON);
    log(`Refreshed Option chains and updated in ${quotesJSON.quotes.length} quotes`);
    log(`Saving quote for index ${quotesJSON.index} with id ${quotesJSON._id.toLocaleString('en-US', IST)}`);
    let saved = await quotesJSON.save();
    log(`Saved quotes at:${saved._id.toLocaleString()}`);
    await stream.push(saved);
    stream.push(null);
  }
}

exports.run = async () => {

  runJob();
  return stream;

}

async function refreshStockQuotes() {

  let quotesJSON = await NSEDataAdapter.getQuotesForFnOStocks()

  let log_suffix = ` for index: ${quotesJSON.index} with ${quotesJSON.quotes.length} symbols and quoteTime: ${quotesJSON.quoteTime.toLocaleString('en-US', IST)}`

  log(`Fetched Quotes` + log_suffix);

  quotesJSON._id = quotesJSON.quoteTime

  //Check if quote alread exists in DB TD
  let quoteQuery = {
    _id: quotesJSON.quoteTime /*, watch_list ,*/
  }

  let quoteDoc = await Quote.findOneAndRemove(quoteQuery).exec()

  //save the quotes in the DB once they are downloaded
  quoteDoc = await Quote.create(quotesJSON)
    .catch(
      err => log(`Error ${err} saving quotes` + log_suffix)
    )

  log(`Upserted Quotes` + log_suffix);

  return quoteDoc;

  /*
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
  */
  //resolve the promise for the insert
}

function refreshOptionChains(quotesJSON) {
  let hoursFromOpen = moment().clone().utcOffset('+05:30').hour() - 9;
  hoursFromOpen = hoursFromOpen > 0 ? hoursFromOpen : 1;

  let frontMonthExpiry = NSEDataAdapter.getFrontMonthExpiryDate(moment(), 'DDMMMYYYY').toUpperCase();


  let chunkedQuotes = chunk(quotesJSON.quotes, 3);

  log(`Retrieving Option Chains for ${quotesJSON.quotes.length} symbols for ${frontMonthExpiry}`);

  //Promise for each stockQuote that is resolved when the Option Chain is retrieved and saved
  return chunkedQuotes.reduce(async (quoteArr=[],quotesJSON,i) => {
    let newChunk = await refreshOptionChainForQuoteChunk(quotesJSON, hoursFromOpen, frontMonthExpiry)
    try {    return [...(await quoteArr),...newChunk];
    }
    catch(error) {
      console.log(`Chunk of length ${newChunk.length} getting into QuoteArray of length ${quoteArr} has error ${error}`)
    }
  })
  .then((quotes) => {
    let qj = quotesJSON;
    qj.quotes = quotes;
    return qj;
  });

}

function refreshOptionChainForQuoteChunk(quotes, hoursFromOpen, frontMonthExpiry) {
  return Promise.all(quotes.map(stockQuote => {
    //avgtrdVol: 40 lacs and avgTurnOver = 100 for 212 symbols for 6 trading hours
    if ((stockQuote.trdVol > (5 * hoursFromOpen)) || (stockQuote.ntP > (15 * hoursFromOpen))) { //TD Previous days value and from config
      //  if ((stockQuote.symbol==='RELIANCE') || (stockQuote.symbol==='HINDALCO')) {
      return refreshOptionChain(stockQuote, frontMonthExpiry)
        .then((oc) => getExpectedMoveForQuote(stockQuote));
    }
    else
      return stockQuote;
  }))
}

async function refreshOptionChain(stockQuote, frontMonthExpiry) {

  let optionChainArr = await NSEDataAdapter.getStockOptionChain(stockQuote.symbol, frontMonthExpiry);

  if (!optionChainArr && optionChainArr.length <= 0)
    log(`No Option Chain returned for ${stockQuote.symbol} for ${frontMonthExpiry} `);
  //TD: Return Promise?
  else {

    log(`Fetched Option Chain for ${stockQuote.symbol}/ ${frontMonthExpiry} with ${optionChainArr.length} strikes and quoteTime: ${stockQuote.quoteTime}`);

    //Check if option chain already exists in DB TD: Use a better primary key
    let ocQuery = {
      symbol: stockQuote.symbol,
      expDt: frontMonthExpiry /*, quoteId:stockQuote._id ,*/
    }

    let optionChainDoc = await OptionChain.findOneAndRemove(ocQuery).exec()

    //Merge strikes array
    let arr = optionChainArr;

    if (optionChainDoc) {
      let patch = jsonpatch.compare(optionChainArr, optionChainDoc.strikes);
      arr = jsonpatch.applyPatch(optionChainArr, patch).newDocument;
    }

    //create new option chain
    let optionChainJSON = {
      symbol: stockQuote.symbol,
      quoteId: stockQuote._id,
      expDt: frontMonthExpiry, //TD: expiry date to date

      spot: stockQuote.ltP,
      mrgnPer: stockQuote.frontMonthMarginPercent,
      //  lotSz: Number, //TD
      expDays: NSEDataAdapter.getDaysToFrontMonthExpiry(),
      strikes: arr
    };

    //Save new options chain in DB
    optionChainDoc = await OptionChain.create(optionChainJSON)
    // .catch(
    //   err =>{
    //     // console.log(JSON.stringify(optionChainJSON));
    //     log(`Error Creating Option Chain for ${optionChainJSON.symbol} / ${frontMonthExpiry}: ${err}`)
    //   }
    // )

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
        expHiHlfSD: o.expHiHlfSD,
        expLoHlfSD: o.expLoHlfSD,
        expHiOneSD: o.expHiOneSD,
        expLoOneSD: o.expLoOneSD,
      } = expOC);

      log(`Stock ${stockQuote.symbol} has expected high/low as ${stockQuote.expectedHigh}/${stockQuote.expectedLow}`)
      return stockQuote
    })
}
