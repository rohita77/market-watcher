'use strict'

import moment from 'moment';
var webScrapTools = require('./modules/web-scrap-tools');
var optionChain = require('./option-chain');

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


export function getExpiryDate(tradingDate) {

    let eom = moment(tradingDate).endOf('month');

    //If eom is before Thursday then Last Thursday else This Thursday
    let expiryThursday = eom.clone().day(eom.day() <= 3 ? -3 : 4)

    //TD: Handle Trdaing Holidays

    //Trading month falls in Current Month Expiry or Next Month Expiry
    return (expiryThursday.isSameOrAfter(tradingDate) ) ? expiryThursday : getExpiryDate(eom.clone().add(1,"day"));

}

export function getExpiryMonth(tradingDate,formatString="MMM-YY") {

    return getExpiryDate(tradingDate).format(formatString);

}


export function getNextTradingDate(currentTradingDate = moment().clone().utcOffset("+05:30") ) {

//https://nse-india.com/products/content/derivatives/equities/mrkt_timing_holidays.htm
/*
[26-Jan-17,
24-Feb-17,
13-Mar-17,
4-Apr-17,
14-Apr-17,
1-May-17,
26-Jun-17,
15-Aug-17,
25-Aug-17,
2-Oct-17,
19-Oct-17,
20-Oct-17,
25-Dec-17,
]
*/

    //> 16:00 add 2

    let getNextTradingDate = (currentTradingDate.isBefore(16,"HH"))?currentTradingDate:currentTradingDate.clone().add(1,"days");

    if (getNextTradingDate.isoWeekday()>5) getNextTradingDate.isoWeekday(8);
    return getNextTradingDate;
}


export let getStockOptionChain2 = optionChain.getStockOptionChain;