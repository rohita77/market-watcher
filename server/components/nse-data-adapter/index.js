'use strict'

var moment = require('moment');

//import NSEDownload from './downloads';
var NSEDownload = require('./downloads'); //TD:

//Get Trading holiday from DB or inject
const tradingHolidays = [

    //https://nse-india.com/products/content/derivatives/equities/mrkt_timing_holidays.htm
    "21-Feb-2020",
    "10-Mar-2020",
    "02-Apr-2020",
    "06-Apr-2020",
    "10-Apr-2020",
    "14-Apr-2020",
    "01-May-2020",
    "25-May-2020",
    "02-Oct-2020",
    "16-Nov-2020",
    "30-Nov-2020",
    "25-Dec-2020"
    ];

function isTradingHoliday (calendarDate = moment()) {

    let mcalendarDate = moment(calendarDate).utcOffset("+05:30").startOf('day');
    let calendarDateString = mcalendarDate.format("DD-MMM-YY");

    return tradingHolidays.find((date) =>
        (calendarDateString===date)) ? true : false;

}

exports.isTradingHoliday = isTradingHoliday


function getNextTradingDate (currentDate = moment()) {

    //local moment('2016-01-01T23:35:01') --> "2016-01-01T23:35:01-06:00";
    //utc moment.utc('2016-01-01T23:35:01'); --> "2016-01-01T23:35:01+00:00"
    //Fixed Offset: moment.parseZone("2013-01-01T00:00:00-13:00") --> "2013-01-01T00:00:00-13:00"
    //Local Format: .format()

    // console.log(currentDate);
    let mcurrentDate = moment(currentDate).utcOffset("+05:30");
    let closeOfTrading = mcurrentDate.clone().hour(15).minute(30);

    let nextTradingDate = (mcurrentDate.isSameOrBefore(closeOfTrading)) ? mcurrentDate : mcurrentDate.clone().add(1, "days");

    nextTradingDate = nextTradingDate.startOf('day').hour(15).minute(30);    //Last minute of trading for the given trading date

    if (nextTradingDate.isoWeekday() > 5) nextTradingDate.isoWeekday(8); //Next Monday

    return isTradingHoliday(nextTradingDate) ? getNextTradingDate(nextTradingDate.clone().add(1, "days")) : nextTradingDate.toDate();
}

exports.getNextTradingDate = getNextTradingDate;


function getMonthlyExpiryDate (tradingDate, dtFormat) {

    let eom = moment(tradingDate).utcOffset("+05:30").endOf('month');

    eom = eom.startOf('day').hours(15).minute(30); //Last minute of trading

    //TD: Get 1st Expiry Date from DB that is greater than trading date

    //If eom is before Thursday then Last Thursday else This Thursday
    let expiryThursday = eom.clone().day(eom.day() <= 3 ? -3 : 4)

    //Handle Trading Holidays
    let expiryDate = (!isTradingHoliday(expiryThursday)) ? expiryThursday : expiryThursday.subtract(1, "day");

    //TD: what if day before is also trading holiday?

    //Return Raw date or Formatted date?
    let retExpDate = (dtFormat) ? expiryDate.format(dtFormat) : expiryDate.toDate();

    //Trading month falls in Current Month Expiry or Next Month Expiry
    return (expiryDate.isSameOrAfter(tradingDate)) ? retExpDate : getMonthlyExpiryDate(eom.clone().add(1, "day"), dtFormat);

}

exports.getMonthlyExpiryDate = getMonthlyExpiryDate

function getFrontMonthExpiryDate (tradingDate = moment(), dtFormat='YYYY-MM-DD') {
    return getMonthlyExpiryDate(tradingDate, dtFormat);
}

exports.getFrontMonthExpiryDate=getFrontMonthExpiryDate

exports.getBackMonthExpiryDate=(tradingDate = moment(), dtFormat='YYYY-MM-DD') =>{
    let frontMonthExpiryDate = getFrontMonthExpiryDate(tradingDate)
    let backMonthFirstTradingDate = moment(frontMonthExpiryDate).add(1, "days")

    return getMonthlyExpiryDate(backMonthFirstTradingDate, dtFormat);
}


exports.getPreviousMonthExpiryDate=(tradingDate = moment(), dtFormat="YYYY-MM-DD") =>{
    let frontMonthExpiryDate = getFrontMonthExpiryDate(tradingDate)

    let firstOfMonth = moment(frontMonthExpiryDate).utcOffset("+05:30").startOf('month');
    firstOfMonth = firstOfMonth.startOf('day').hours(15).minute(30); //Last minute of trading
    let firstOfPreviousMonth = moment(firstOfMonth).subtract(1, "month")

    return getMonthlyExpiryDate(firstOfPreviousMonth, dtFormat);
}

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
                        </select>
 */


exports.getSymbolsInWatchList=(watchlist) =>{

    return NSEDownload.getSymbolsInIndex(watchlist.downloadKey);

}

exports.getFCBoardMeetings=() =>{

    return NSEDownload.getBoardMeetings('All_Forthcoming');

}

exports.getBoardMeetingsForLast3Months=() =>{

    return NSEDownload.getBoardMeetings('Last_3_Months'); //12 Months? To deal with boundary value past earningg

}

exports.getFnOLotSizes=() =>{

    return NSEDownload.getFnOLotSizes(); //No Download Key

}

function getDaysToFrontMonthExpiry (tradingDate = moment()) {

    return moment(getFrontMonthExpiryDate(tradingDate)).diff(moment(getNextTradingDate(tradingDate)), 'days');
}

function getDaysToExpiry(expiryDate = moment(),tradingDate=moment()) {

    return moment(expiryDate).diff(moment(getNextTradingDate(tradingDate)), 'days');
}


exports.getDaysToFrontMonthExpiry = getDaysToFrontMonthExpiry

exports.getDaysToExpiry = getDaysToExpiry


exports.getQuotesForFnOStocks=() =>{

    return NSEDownload.getQuotesForIndexStocks('foSecStockWatch')
        .then(quotesJSON => {
            quotesJSON.nxtTrdDt = getNextTradingDate();
            quotesJSON.frMnthExpDt = getFrontMonthExpiryDate();
            quotesJSON.dysToFrMnthExp = getDaysToFrontMonthExpiry();
            return quotesJSON;
        }

        );

}

exports.getStockOptionChain =(symbol, expiryDate) =>{

    return NSEDownload.getStockOptionChain(symbol, expiryDate);

}