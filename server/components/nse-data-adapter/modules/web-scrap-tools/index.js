'use strict'

let request = require('request');
let requestPromise = require('request-promise');
let cheerio = require('cheerio');

let csvtojson = require('csvtojson');

let moment = require('moment');

const fetch = require('node-fetch');
const Headers = require('node-fetch').Headers
const setCookie = require('set-cookie-parser');

function now() {
  return moment().format('HH:mm:ss Z');
}

function log(message) {
  console.log(`${now()} ${message}`);
}

const headers = {
  // 'Host': 'www.nseindia.com',
  'Accept-Encoding': 'gzip, deflate, sdch, br',
  'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
  'Connection': 'keep-alive',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': 1,
  // 'Referer' : 'https://www.nseindia.com',
  'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
  'Accept': '*/*',
  // 'X-Requested-With': 'XMLHttpRequest'

};

function setCookies() {
  log(`Inside setCookie`);

  let options = {
    //TD: Parameterise
    url: 'https://www.nseindia.com',
    headers: headers,
    gzip: true,
    resolveWithFullResponse: true
  };

  return requestPromise(options)
    .then((response) => {
      let cookies = setCookie.parse(response, {
        decodeValues: true // default: true
      });

      if (cookies) {
        cookies = cookies.map(cookie => cookie.name + '=' + cookie.value)
          .join(';')
        log(`Cookies are: ${cookies}`)
        headers.cookie = cookies;
      } else
        console.error(`${now()} No cookie found`)

    })
    .catch(error => console.error(`${now()} Reques error while fetching cookie : ${error}`))

}

setCookies();

exports.getSmallJSON = async (url) => {

  if (!headers.cookie) await setCookies()

  if (!headers.cookie) throw new Error("No Cookie Found");

  let headers_fetch = new Headers(headers)

  //     const headers = new Headers(meta);

  // // The above is equivalent to
  // const meta = [
  //   [ 'Content-Type', 'text/xml' ],
  //   [ 'Breaking-Bad', '<3' ]
  // ];

  let options = {
    // uri: url,
    method: 'GET',
    headers: headers_fetch,

    // json: true,
    // gzip: true

    // timeout: 0,         // req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies). Signal is recommended instead.
    compress: true, // support gzip/deflate content encoding. false to disable
    // size: 0,            // maximum response body size in bytes. 0 to disable
    // agent: null         // http(s).Agent instance or function that returns an instance (see below)

  };

  log(`Downloading from url ${url}`);

  // return requestPromise(options)
  return fetch(url, options)
    .then(res => {
      if (res.ok)
        return res.json()
      else
        console.error(`${now()} Unsuccessful getSmallJSON:${url} with status ${res.status}:${res.statusText} `)
    })
    .catch(err => console.error(`${now()} Fetch error ${err}`))
}

exports.getSmallCsv = (url, csvMapper) => {

  let options = {
    url: url,
    headers: headers,
    gzip: true,

  };

  log(`Downloading CSV File from: ${options.url}`);

  return new Promise((resolve, reject) => {

    //end_parsed will be emitted once parsing finished
    // csvConverter.on("end_parsed",

    let jsonArray = [];
    let onError = (e) => console.log(`Error gettings symbols from  ${options.url} Error: ${e}`);
    let onComplete = () => {
      jsonArray => console.log('Found LT:' + jsonArray.find(symbol => {
        return symbol.symbol.match('\^LT$')
      }).name)

      resolve(jsonArray)
    };

    // console.log(`CSV is ${JSON.stringify(request.get(options))}`);

    csvtojson()
      .fromStream(request.get(options))
      .subscribe(jsonLine =>
        // {
        // console.log(`Line: ${JSON.stringify(jsonLine)}`);
        // return
        jsonArray.push(csvMapper(jsonLine)), onError, onComplete
        // }
      )

  });


}


exports.getSmallHTML = (url, htmlToJSONTransformer) => {

  let options = {
    url: url,
    headers: headers,
    gzip: true,
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
