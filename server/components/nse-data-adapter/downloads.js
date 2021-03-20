'use strict';

//import NSEDataAdapter from './index';
let moment = require('moment');

var webScrapTools = require('./modules/web-scrap-tools');
var optionChain = require('./option-chain');

function now() {
  return moment().format('HH:mm:ss Z');
}

function log(message) {
  console.log(`${now()} ${message}`);
}

exports.getSymbolsInIndex = (downloadKey) => {
  let url = 'https://www1.nseindia.com/content/indices/ind_' + downloadKey + '.csv';
  // https://www1.nseindia.com/content/indices/ind_nifty50list.csv
  const indexCsvMapper = elem => ({
    name: elem['Company Name'],
    symbol: elem.Symbol,
    industry: elem.Industry,
    _id: elem['ISIN Code']
  });


  return webScrapTools.getSmallCsv(url, indexCsvMapper);
}

exports.getBoardMeetings = (downloadKey) => {
  let url = 'https://www1.nseindia.com/corporates/datafiles/BM_' + downloadKey + '.csv';

  const bmCsvMapper = elem => ({
    symbol: elem.Symbol,
    purpose: elem.Purpose,
    boardMeetingDate: new Date(elem.BoardMeetingDate + ' GMT+0530')
  });

  return webScrapTools.getSmallCsv(url, bmCsvMapper);
}

exports.getFnOLotSizes = (downloadKey) => {
  let url = 'https://www1.nseindia.com/content/fo/fo_mktlots.csv' //+ downloadKey + '.csv';

  const fnOLotSizeCsvMapper = elem => {
    //TD: Use spread operator mklot : {elem[2]...elem[12]}

    let e = {
      symbol: elem.SYMBOL,
      mktlot: elem
    }
    e.mktlot.SYMBOL = undefined;
    e.mktlot.UNDERLYING = undefined;

    return e;
  }

  return webScrapTools.getSmallCsv(url, fnOLotSizeCsvMapper);
}

exports.getQuotesForIndexStocks = async (index) => {
  // let url = `https://www1.nseindia.com/live_market/dynaContent/live_watch/stock_watch/${index}.json`;
  let url = `https://www.nseindia.com/api/equity-stockIndices?index=${encodeURIComponent(index)}`

  try {
    let res = await webScrapTools.getSmallJSON(url)

    res.index = index;
    [res.quoteTime, res.time] = [new Date(res.time + ' GMT+0530'), res.quoteTime];
    res.quoteDate = moment(res.quoteTime).utcOffset('GMT+05:30').startOf('day').hours(16).toDate();
    res.refreshTime = new Date();
    // [res.quotes, res.data] = [res.data, res.quotes]

    res.quotes = res.data.map(quote => ({
      'symbol': quote.symbol,
      'open': quote.open,
      'high': quote.dayHigh,
      'low': quote.dayLow,
      'ltP': quote.lastPrice,

      'ptsC': quote.change,
      'per': quote.pChange,
      'trdVol': quote.totalTradedVolume / 100000,
      //  trdVolM: ,
      //Volume in Crores
      'ntP': quote.totalTradedValue / (100000 * 100),
      //  mVal: ,
      'wkhi': quote.yearHigh,
      'wklo': quote.yearLow,
      // wkhicm_adj: ,
      // wklocm_adj: ,
      'xDt': quote.xDt,
      'cAct': quote.cAct,
      'yPC': quote.perChange365d,
      'mPC': quote.perChange30d,

    }))

    let IST = {
      timeZone: "Asia/Calcutta",
      timeZoneName: "short"
    };

    log(`Number of Quotes: ${res.quotes.length} as of ${res.quoteTime.toLocaleString("en-US", IST)} for trade date ${res.quoteDate.toLocaleString("en-US", IST)} retrieved at ${res.refreshTime.toLocaleString()}`);

    return res;

  } catch (error) {
    console.error(`${now()} Parsing getQuotesForIndexStocks:${url} has error ${error}`)
    throw new Error(`${now()} Parsing getQuotesForIndexStocks:${url} has error ${error}`)
  }

}

exports.getStockOptionChain = optionChain.getStockOptionChain;
