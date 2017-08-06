'use strict'

import request from 'request';

import csvtojson from 'csvtojson';

export function getSymbolsInIndex(downloadKey) {
    let url = 'https://www.nseindia.com/content/indices/ind_' + downloadKey + '.csv';

    const indexCsvMapper = elem => ({
        name: elem['Company Name'],
        symbol: elem.Symbol,
        industry: elem.Industry,
        _id: elem['ISIN Code']
    });


    return getSmallCsv(url, indexCsvMapper);
}

export function getBoardMeetings(downloadKey) {
    let url = 'https://nseindia.com/corporates/datafiles/BM_' + downloadKey + '.csv';

    const bmCsvMapper = elem => ({
        symbol: elem.Symbol,
        purpose: elem.Purpose,
        boardMeetingDate: new Date(elem.BoardMeetingDate + ' GMT+0530')
    });

    return getSmallCsv(url, bmCsvMapper);
}

function getSmallCsv(url, csvMapper) {
    const headers = {
        'Host': 'www.nseindia.com',
        'Upgrade-Insecure-Requests': 1,
        'User-Agent': 'Mozilla/5.0(Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36(KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36',
        'Accept': 'application/csv,text/csv',
        'Accept-Encoding': 'gzip, deflate, sdch, br',
    };

    let options = {
        url: url,
        headers: headers
    };

    let csvConverter = new csvtojson.Converter({ constructResult: true }); //for small csv data

    console.log(`Downloading CSV File from: ${options.url}`);

    return new Promise((resolve, reject) => {

        //end_parsed will be emitted once parsing finished
        csvConverter.on("end_parsed",
         jsonArray => resolve(jsonArray.map(csvMapper))
            // console.log('Found LT:' + jsonArray.find(symbol => { return symbol.symbol.match('\^LT$') }).name);
        );

        request.get(options).pipe(csvConverter);

    });


}