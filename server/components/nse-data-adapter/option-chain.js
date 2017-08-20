'use strict'
var webScrapTools =require('./modules/web-scrap-tools');

export function getStockOptionChain(symbol, expiryDate) {
    let url = `https://nse-india.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp?instrument=OPTSTK&symbol=${symbol}&date=${expiryDate}`;

    const optionChainHtmlToJSONTransformer = $ => {

        let trArr = $('#octable > tbody > tr');
        trArr.splice(-1, 1);

        return Array.from(trArr.map((i, tr) => {

            let tdArr = $(tr).children('td');
            let optionArr = Array.from(
                tdArr.map((i, td) => webScrapTools.parseTagAsAsNumber($, td))
            );

            let strikePrice, call, put, rest;

            [call, rest] = getOptionJSON(optionArr);
            strikePrice = rest[0];
            [put, rest] = getOptionJSON(rest.reverse());

            return {
                strikePrice: strikePrice,
                call: call,
                put: put
            }

        }))
    }

    return webScrapTools.getSmallHTML(url)
        .then($ => optionChainHtmlToJSONTransformer($));
}



let getOptionJSON = (optionArr) => {
    let x, o = {}, rest;
    (
        [x, o.oi, o.chngInOI, o.volume, o.iv, o.ltp, o.netChng, o.bidQty, o.bidPrice, o.askPrice, o.askQty, ...rest] = optionArr

    )

    return [o, rest];
}
