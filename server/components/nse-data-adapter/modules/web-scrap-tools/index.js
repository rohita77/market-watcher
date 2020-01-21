'use strict'

let request =require('request');
let requestPromise =require('request-promise');
let cheerio =require('cheerio');

let csvtojson =require('csvtojson');

let moment =require('moment');

function now() {
    return moment().format('HH:mm:ss Z');
}

function log(message) {
    console.log(`${now()} ${message}`);
}

const headers = {
    // 'Host': 'www.nseindia.com',
    // 'Accept-Encoding': 'gzip, deflate, sdch, br',
    // 'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
    'Connection': 'keep-alive',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': 1,
    // 'Referer' : 'https://www1.nseindia.com/products/content/derivatives/equities/historical_fo.htm',
    'User-Agent' : 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
    // 'Accept' :  '*/*',b
    // 'X-Requested-With': 'XMLHttpRequest'

};

exports.getSmallJSON=(url) =>{

    let options = {
        uri: url,
        headers: headers,
        json: true,
        gzip:true
    };

    log(`downloading from url ${url}`);

    /*
        var options = {
            uri: url,
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true // Automatically parses the JSON string in the response
        };
    */

    return requestPromise(options)
}


exports.getSmallCsv=(url, csvMapper) =>{

    let options = {
        url: url,
        headers: headers,
        gzip:true,

    };

    log(`Downloading CSV File from: ${options.url}`);

    return new Promise((resolve, reject) => {

        //end_parsed will be emitted once parsing finished
        // csvConverter.on("end_parsed",

        let jsonArray = [];
        let onError = (e) => console.log(`Error gettings symbols from  ${options.url} Error: ${e}`);
        let onComplete = () => resolve(jsonArray);

        // console.log(`CSV is ${JSON.stringify(request.get(options))}`);

        csvtojson()
            .fromStream(request.get(options))
            .subscribe(jsonLine =>
                // {
                // console.log(`Line: ${JSON.stringify(jsonLine)}`);
                // return
                jsonArray.push(csvMapper(jsonLine)),onError,onComplete
            // }
            )

        jsonArray =>  console.log('Found LT:' + jsonArray.find(symbol => { return symbol.symbol.match('\^LT$') }).name)

     });


}


exports.getSmallHTML=(url, htmlToJSONTransformer) =>{

    let options = {
        url: url,
        headers: headers,
        gzip:true,
        transform: body => cheerio.load(body)
    };

    return requestPromise(options)
}

let parseTagAsText = ($, td) => $(td).text().trim();

exports.parseTagAsText = parseTagAsText;

exports.parseTagAsAsNumber = ($, td) => {

    let cleanText = parseTagAsText($, td).trim().replace(/,/g, '');
    return isNaN(+cleanText) ? 0 : +cleanText;

}

