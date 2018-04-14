'use strict';

//import NSEDataAdapter from './index';
import moment from 'moment';

var webScrapTools = require('./modules/web-scrap-tools');
var optionChain = require('./option-chain');

function now() {
  return moment().format('HH:mm:ss Z');
}

function log(message) {
  console.log(`${now()} ${message}`);
}

export function getSymbolsInIndex(downloadKey) {
  let url = 'https://www.nseindia.com/content/indices/ind_' + downloadKey + '.csv';

  const indexCsvMapper = elem => ({
      name: elem['Company Name'],
      symbol: elem.Symbol,
      industry: elem.Industry,
      _id: elem['ISIN Code']
  });


  return webScrapTools.getSmallCsv(url, indexCsvMapper);
}

export function getBoardMeetings(downloadKey) {
  let url = 'https://nseindia.com/corporates/datafiles/BM_' + downloadKey + '.csv';

  const bmCsvMapper = elem => ({
      symbol: elem.Symbol,
      purpose: elem.Purpose,
      boardMeetingDate: new Date(elem.BoardMeetingDate + ' GMT+0530')
  });

  return webScrapTools.getSmallCsv(url, bmCsvMapper);
}

export function getFnOLotSizes(downloadKey) {
  let url = 'https://nse-india.com/content/fo/fo_mktlots.csv' //+ downloadKey + '.csv';

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

export function getQuotesForIndexStocks(index) {
  let url = `https://www.nseindia.com/live_market/dynaContent/live_watch/stock_watch/${index}.json`;

  return webScrapTools.getSmallJSON(url)
      .then((res) => {
          res.index = index;
          [res.quoteTime,res.time] = [new Date(res.time + ' GMT+0530'),res.quoteTime];
          res.quoteDate = moment(res.quoteTime).utcOffset('GMT+05:30').startOf('day').hours(16).toDate();
          res.refreshTime = new Date();
          [res.quotes, res.data] = [res.data,res.quotes]
          let IST = { timeZone: "Asia/Calcutta", timeZoneName: "short" };

          log(`Number of Quotes: ${res.quotes.length} as of ${res.quoteTime.toLocaleString("en-US", IST)} for trade date ${res.quoteDate.toLocaleString("en-US", IST)} retrieved at ${res.refreshTime.toLocaleString()}`);
          return res;

      });
}

export let getStockOptionChain = optionChain.getStockOptionChain;