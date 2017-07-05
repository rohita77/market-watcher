'use strict';

export function getSymbolsInWatchList(watchlist) {
  //NSEAdapter.getSymbolsInIndex('Nifty50') --> {symbol,name,id,id, type}

  var request = require('request');

  var options = {
    url: 'https://www.nseindia.com/content/indices/ind_' + watchlist.downloadKey + '.csv',
    headers: {
      'Host': 'www.nseindia.com',
      'Upgrade-Insecure-Requests': 1,
      'User-Agent': 'Mozilla/5.0(Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36(KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36',
      'Accept': 'application/csv,text/csv',
      'Accept-Encoding': 'gzip, deflate, sdch, br',
    }
  };

  //Converter Class
  var Converter = require("csvtojson").Converter;
  var converter = new Converter({ constructResult: true }); //for small csv data

  console.log("Getting Symbols for Watchlist: " + JSON.stringify(watchlist.name) + ' from ' + options.url);

  var symbolsPromise = new Promise((resolve, reject) => {


    //end_parsed will be emitted once parsing finished
    converter.on("end_parsed", function (jsonArray) {
      resolve(
        jsonArray.map(elem => {
          return {
            name: elem['Company Name']
            , symbol: elem.Symbol
            , industry: elem.Industry
            , id: elem['ISIN Code']
          }
        })

      )

     // console.log('Found LT:' + jsonArray.find(symbol => { return symbol.symbol.match('\^LT$') }).name);
    });

    request.get(options).pipe(converter);

  });

  return symbolsPromise;
}
