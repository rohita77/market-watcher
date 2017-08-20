var requestPromise = require("request-promise");
var cheerio = require("cheerio")

let moment = require('moment');

getStockOptionChain('RELIANCE', '31AUG2017')
    .then((optioChainData) => console.log(optioChainData))

function getStockOptionChain(symbol, expiryDate) {
    let url = `https://nse-india.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp?instrument=OPTSTK&symbol=${symbol}&date=${expiryDate}`;

    const optionChainHtmlToJSONTransformer = $ => {


        const cols = ['oi', 'chngInOI', 'volume', 'iv', 'ltp', 'netChng', 'bidQty', 'bidPrice', 'askPrice', 'askQty'];
        //var option = {oi, chngInOI, volume, iv, ltp, netChng, bidQty, bidPrice, askPrice, askQty};


        trArr = $('#octable > tbody > tr');
        //trArr.splice(0, 2);

        let getTDValue = ($,td) => $(td).text().trim();

        let getTDValueAsNumber = ($,td) => {

                let text = getTDValue($,td);
                let cleanText = text.trim().replace(/,/g, '');
                let num = Number(cleanText, 2);
                return isNaN(cleanText) ? 0 : num;


        }

        return Array.from(trArr.map((i, tr) => {
                let tdArr = $(tr).children('td');

            let t = Array.from(tdArr.map((i,td) => getTDValueAsNumber($,td)));
            console.log(t);

           //chain.call = { c } = (cols.map((c, i) => getTDValueAsNumber($,tr,i + 1)));
            //let call = {};

            // console.log(call);
            //chain.put = { cols } = (cols.map((c, i) => getTDValueAsNumber($,tr,a.length - i + 11)));

            return {
                strikePrice : getTDValueAsNumber($,tr,11),
            //    call : call,
               // put : put
            }

        }))
    }

    return getSmallHTML(url, optionChainHtmlToJSONTransformer);
}

function getSmallHTML(url, htmlToJSONTransformer) {
    const headers = {
        'Host': 'www.nseindia.com',
        'Upgrade-Insecure-Requests': 1,
        'User-Agent': 'Mozilla/5.0(Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36(KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        //'Accept-Encoding': 'gzip, deflate, sdch, br',
        'Accept-Language': 'en-US,en;q=0.8,vi;q=0.6'
    };


    let options = {
        url: url,
        headers: headers,
        transform: body => cheerio.load(body)
    };

    return Promise.resolve(
        requestPromise(options)
            .then($ => htmlToJSONTransformer($))
    )

}