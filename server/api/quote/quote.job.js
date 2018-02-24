//node dist/server/batchApp.job

'use strict';
import _ from 'lodash';
import moment from 'moment';

//import downloads from '../../components/nsedata/downloads'; //TD:
var downloads = require('../../components/nse-data-adapter/downloads');
var NSEDataAdapter = require('../../components/nse-data-adapter/index'); //TD Refactor


//import Model and save to Mongo
import Quote from './quote.model'
import OptionChain from '../../api/option-chain/option-chain.model'

export function run() {

    log("Quote Job Fired");
    return refreshStockQuotes()
        .then((quotesJSON) => {
            log(`Refreshed StockQuotes for Index: ${quotesJSON.index} id:${quotesJSON._id.toLocaleString("en-US", IST)} with ${quotesJSON.quotes.length} symbols and quoteTime: ${quotesJSON.quoteTime.toLocaleString("en-US", IST)}`)
            return quotesJSON;
        })
        //TS+D: Which one to get. The list is big
        .then((quotesJSON) => refreshOptionChains(quotesJSON))
        .then((quotesJSON) => {
            log(`Refreshed Option chains and updated in ${quotesJSON.quotes.length} quotes`);
            return quotesJSON;
        })
        .then((quotesJSON) => {
            log(`Saving quote for index ${quotesJSON.index} with id ${quotesJSON._id.toLocaleString("en-US", IST)}`)
            return quotesJSON.save();

        })
        .then((saved) => {
            log(`Saved quotes at:${saved.lastMod.toLocaleString()}`);
        });

}

let IST = { timeZone: "Asia/Calcutta", timeZoneName: "short" };

function now() {
    return moment().format('HH:mm:ss Z');
}

function log(message) {
    console.log(`${now()} ${message}`);
}

function refreshStockQuotes() {

    return downloads.getQuotesForFnOStocks()
        //save the quotes in the DB once they are downloaded
        .then(quotesJSON => {
            log(`Fetched Quotes for index: ${quotesJSON.index} with ${quotesJSON.quotes.length} symbols and quoteTime: ${quotesJSON.quoteTime.toLocaleString("en-US", IST)}`);

            return Quote.findOneAndUpdate({ _id : quotesJSON.quoteTime }, quotesJSON, { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true,runSettersOnQuery : true }).exec()
                .then((doc,err) => {
                    log(`Upserted Quotes for index: ${quotesJSON.index} / with ${quotesJSON.quotes.length} symbols and quoteTime: ${quotesJSON.quoteTime.toLocaleString("en-US", IST)} and refreshTime: ${doc.refreshTime.toLocaleString()}`);
                    if (err)  log(err); //undefined
                    return doc;
                });

        })
    //resolve the promise for the insert
}

function refreshOptionChains(quotesJSON) {
    let hoursFromOpen = moment().clone().utcOffset("+05:30").hour() - 9;
    hoursFromOpen = hoursFromOpen > 0 ? hoursFromOpen : 1;

    let currentDate = moment().clone().utcOffset("+05:30");
    let nextTradingDate = NSEDataAdapter.getNextTradingDate(currentDate)
    let frontMonth = NSEDataAdapter.getExpiryMonth(nextTradingDate, "DDMMMYYYY").toUpperCase();

    log(`Retrieving Option Chains for ${quotesJSON.quotes.length} symbols for ${frontMonth}`);

    //Promise for each stockQuote that is resolved when the Option Chain is retrieved and saved
    return Promise.all(
        quotesJSON.quotes.map(stockQuote => {
            //avgtrdVol: 40 lacs and avgTurnOver = 100 for 212 symbols for 6 trading hours
            if ((stockQuote.trdVol > (5 * hoursFromOpen)) || (stockQuote.ntP > (15 * hoursFromOpen))) { //TD Previous days value and from config
                //    if ((stockQuote.symbol == 'RELIANCE') || (stockQuote.symbol == 'HINDALCO')) {

                return refreshOptionChain(stockQuote, frontMonth)
                    .then((oc) => getExpectedMoveForQuote(stockQuote))
            }
            else
                return stockQuote;
        }))
        .then((quotes) => {
            let qj = quotesJSON;
            qj.quotes = quotes;
            return qj;
        })
}

function refreshOptionChain(symbol, frontMonth) {

    return downloads.getStockOptionChain(symbol, frontMonth)
        //save the option chain in the DB once they are downloaded
        .then(optionChainArr => {
            if (optionChainArr && optionChainArr.length > 0) {

                let optionChainJSON = {
                    symbol: stockQuote.symbol,           //TD: Sub docs expiry date, strike price, option
                    quoteId: stockQuote._id,
                    expiryDate: frontMonth,
                    strikes: optionChainArr
                };

                log(`Fetched Option Chain for ${stockQuote.symbol}/ ${frontMonth} with ${optionChainArr.length} strikes and quoteTime: ${stockQuote.quoteTime}`);

                return OptionChain.create(optionChainJSON)
                    .then((doc) => {
                       return doc;
                    } )
                    .catch((err) => {
                        log(`Error Creating Option Chain for ${stockQuote.symbol} / ${frontMonth}: ${err}`);
                        return null;
                    });
            }
            else
                log(`No Option Chain Returned for ${stockQuote.symbol} for ${frontMonth} `);
            //TD: Return Promise?

        })

}

function getExpectedMoveForQuote(stockQuote) {

    //Get Expected High and Low and options at High and Low Symbol
    //TD: pass quoteId
    return OptionChain.getOptionChainSubsetForSymbol(stockQuote.symbol, stockQuote.ltP)
        .project({
            "_id": false,
            symbol: true,
            expectedHigh: true,
            expectedLow: true,
            expectedHighOptions: '$firstStrikeAboveExpectedHigh',
            expectedLowOptions: '$firstStrikeBelowExpectedLow'

        })
        .exec()
        .then((docs, err) => docs[0] ? docs[0] : {})
        .then((expOC) => {
            let o = stockQuote;
            ({ expectedHigh: o.expectedHigh, expectedLow: o.expectedLow, expectedHighOptions: o.expectedHighOptions, expectedLowOptions: o.expectedLowOptions } = expOC);
            log(`Stock ${stockQuote.symbol} has expected high/low as ${stockQuote.expectedHigh}/${stockQuote.expectedLow}`)
            return stockQuote
        })
        DailyAverageQuotes
}