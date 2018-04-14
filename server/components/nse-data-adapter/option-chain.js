'use strict'
var webScrapTools =require('./modules/web-scrap-tools');

export function getStockOptionChain(symbol, expiryDate) {
    let url = `https://nse-india.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp?instrument=OPTSTK&symbol=${encodeURIComponent(symbol)}&date=${expiryDate}`;

    // console.log(url);
    //TD : As on Sep 22, 2017 15:30:29 IST //*[@id="wrapper_btm"]/table[1]/tbody/tr/td[2]/div/span[2]/text()
    //#wrapper_btm > table:nth-child(3) > tbody > tr > td:nth-child(2) > div > span:nth-child(2)

    const optionChainHtmlToJSONTransformer = $ => {

        let trArr = $('#octable > tbody > tr');
        trArr.splice(-1, 1);

        return Array.from(trArr.map((i, tr) => {

            let tdArr = $(tr).children('td');
            let optionArr = Array.from(
                tdArr.map((i, td) => webScrapTools.parseTagAsAsNumber($, td))
            );

            let strikePrice, call={}, put={}, rest,quote,bidAsk;

            [call.quote, rest] = getQuoteJSON(optionArr);
            [call.bidAsk, rest] = getBidAskJSON(rest);

            [strikePrice,...rest] = rest;

            [put.bidAsk, rest] = getBidAskJSON(rest);
            [put.quote, rest] = getQuoteJSON(rest.reverse());

            return {
                price: strikePrice,
                call: Object.assign(call.quote,call.bidAsk),
                put: Object.assign(put.quote,put.bidAsk)
            }

        }))
    }

    return webScrapTools.getSmallHTML(url)
        .then($ => optionChainHtmlToJSONTransformer($));
}



function getQuoteJSON (optionArr) {
    let x, o = {}, rest;
    (
        [x, o.oi, o.chngInOI, o.vol, o.iv, o.ltp, o.netChng,...rest] = optionArr

    )

    return [o, rest];
}


function getBidAskJSON (optionArr) {
    let x, o = {}, rest;
    (
        [o.bidQty, o.bid, o.ask, o.askQty, ...rest] = optionArr

    )

    return [o, rest];
}
