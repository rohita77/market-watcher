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



export function getQuotesForIndexStocks(index) {
    let url = `https://www.nseindia.com/live_market/dynaContent/live_watch/stock_watch/${index}.json`;

    return webScrapTools.getSmallJSON(url)
        .then((res) => {
            res.index = index;
            [res.quoteTime,res.time] = [new Date(res.time + ' GMT+0530'),res.quoteTime];
            res.refreshTime = new Date();
            [res.quotes, res.data] = [res.data,res.quotes]
            let timeZoneFormat = { timeZone: "Asia/Calcutta", timeZoneName: "short" };

            console.log(`Number of Quotes: ${res.quotes.length} as of ${res.quoteTime.toLocaleTimeString("en-US", timeZoneFormat)} retrieved at ${res.refreshTime.toLocaleTimeString("en-US", timeZoneFormat)}`);
            return res;

        });
}


export function getExpiryDate(tradingDate) {

    let eom = moment(tradingDate).endOf('month');

    //If eom is before Thursday then Last Thursday else This Thursday
    let expiryThursday = eom.clone().day(eom.day() <= 3 ? -3 : 4)

    //TD: Handle Trdaing Holidays

    //Trading month falls in Current Month Expiry or Next Month Expiry
    return (expiryThursday.isSameOrAfter(tradingDate)) ? expiryThursday : getExpiryDate(eom.clone().add(1, "day"));

}

export function getExpiryMonth(tradingDate, formatString = "MMM-YY") {

    return getExpiryDate(tradingDate).format(formatString);

}



export function getNextTradingDate(currentTradingDate = moment().clone().utcOffset("+05:30")) {

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

    let nextTradingDate = (currentTradingDate.isBefore(16, "HH")) ? currentTradingDate : currentTradingDate.clone().add(1, "days");

    if (nextTradingDate.isoWeekday() > 5) nextTradingDate.isoWeekday(8); //Next Monday
    return nextTradingDate;
}


export let getStockOptionChain = optionChain.getStockOptionChain;

/*
<select name="bankNiftySelect" id="bankNiftySelect" onchange="changeNiftyView();" class="goodTextBox" style="width:210px;">
                            <optgroup label="Broad Market Indices">
                            <option value="nifty">Nifty 50 </option>
                            <option value="juniorNifty"> Nifty Next 50 </option>
                            <!-- <option value="indiavix"> INDIA VIX </option>
                            <option value="cnx100"> CNX 100</option>
                            <option value="defty"> S&P CNX DEFTY </option>
                            <option value="cnx500"> S&P CNX 500 </option>
                            <option value="midcap"> CNX MIDCAP </option>-->
							<!-- <option value="nseliquid"> Nifty100 Liquid 15 </option> -->
                            <option value="niftyMidcap50"> Nifty Midcap 50 </option>
							<!-- <option value="niftyMidcapLiq15"> Nifty Midcap Liquid 15 </option> -->
                            </optgroup>
                            <optgroup label="Sectoral Indices">
							<option value="cnxAuto">Nifty Auto</option>
							<option value="bankNifty">Nifty Bank</option>
							<option value="cnxEnergy">Nifty Energy</option>
							<option value="cnxFinance">Nifty Financial Services</option>
							<option value="cnxFMCG">Nifty FMCG</option>
							<option value="cnxit">Nifty IT</option>
							<option value="cnxMedia">Nifty Media</option>
							<option value="cnxMetal">Nifty Metal</option>
							<option value="cnxPharma">Nifty Pharma</option>
							<option value="cnxPSU">Nifty PSU Bank</option>
							<option value="cnxRealty">Nifty Realty</option>
							<option value="niftyPvtBank">Nifty Private Bank</option>
							</optgroup>
							<optgroup label="Thematic Indices">
							<option value="cnxCommodities">Nifty Commodities</option>
							<option value="cnxConsumption">Nifty India Consumption</option>
							<option value="cpse">Nifty CPSE</option>
							<option value="cnxInfra">Nifty Infrastructure</option>
							<option value="cnxMNC">Nifty MNC</option>
							<option value="ni15">Nifty Growth Sector 15</option>
							<option value="cnxPSE">Nifty PSE</option>
							<option value="cnxService">Nifty Services Sector</option>
							<option value="nseliquid"> Nifty100 Liquid 15 </option>
							<option value="niftyMidcapLiq15"> Nifty Midcap Liquid 15 </option>
							</optgroup>
							<optgroup label="Strategy Indices">
							<option value="cnxDividendOppt">Nifty Dividend Opportunities 50</option>
							<option value="nv20">Nifty50 Value 20</option>
							<option value="niftyQuality30">Nifty Quality 30</option>
							</optgroup>
							<optgroup label="Others">
                            <option value="sovGold">Sovereign Gold Bonds</option>
							<option value="foSec"> FO Stocks</option>
							<option value="etf"> ETF</option>
							<option value="goldEtf">Gold ETF</option>
							<option value="nifty50Etf">Nifty 50 ETF</option>
							<option value="iL">Institutional Stock Watch</option>
							<option value="bL">BL Stock Watch</option>
							<option value="cbmSecList">Bonds in CM</option>
							</optgroup>
                        </select> */