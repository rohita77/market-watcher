'use strict'

import request from 'request';
import requestPromise from 'request-promise';
import cheerio from 'cheerio';

import csvtojson from 'csvtojson';

import moment from 'moment';

export function getSmallJSON(url) {

    const headers = {
        'Host': 'www.nseindia.com',
        'Upgrade-Insecure-Requests': 1,
        'User-Agent': 'Mozilla/5.0(Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36(KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        //'Accept-Encoding': 'gzip, deflate, sdch, br',
        'Accept-Language': 'en-US,en;q=0.8,vi;q=0.6'
    };


    let options = {
        uri: url,
        headers: headers,
        json: true
    };

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


export function getSmallCsv(url, csvMapper) {
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


export function getSmallHTML(url, htmlToJSONTransformer) {
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

    return requestPromise(options)
}

export let parseTagAsText = ($, td) => $(td).text().trim();

export let parseTagAsAsNumber = ($, td) => {

    let cleanText = parseTagAsText($, td).trim().replace(/,/g, '');
    return isNaN(+cleanText) ? 0 : +cleanText;

}

