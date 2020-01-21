'use strict'

const moment = require('moment');
const ISTOffset = 5.5 * 60 * 60000;


let getPipelineForClosingQuotes = (symbols, marketQuoteDate) => {

    // let n = (n1 = 0) => (typeof n1 !== 'undefined') ? n1 : 0;

    //TD: Convert marketQuoteDate to UTC start and end instead of converting $quoteTime and then match
    //TD: store Trade Date and Time in IST

    //* User aggregation framework
    let stage = {};
    let pipeline = [];
    let $project = {};

    stage.$addFields = {
        marketQuoteTime: {
            $add: ["$quoteTime", ISTOffset]
        }
    };
    pipeline.push(stage);

    stage = {};
    stage.$addFields = {
        marketQuoteDate: {
            $dateToString: { format: "%G%m%d", date: "$marketQuoteTime" }
        }
    };
    pipeline.push(stage);

    pipeline.push({ $sort: { marketQuoteTime: -1 } });

    if (marketQuoteDate) {
        pipeline.push({
            $match: {
                marketQuoteDate: marketQuoteDate
            }
        });
        pipeline.push({ $skip: 1 });
    }

    stage = {};
    stage.$group = {
        _id: "$marketQuoteDate",
        marketQuoteTime: { $first: "$marketQuoteTime" },
        refreshTime: { $first: "$refreshTime" },
        quoteTime: { $first: "$quoteTime" },
        // quotes : {
        //     $slice : [{$addToSet : "$quotes"}, 1, 1]
        // },
        // quotes: { $first: { $slice: ["$quotes", 1, 1] }},
        // quotes: { $slice: ["$quotes", 1, 2] },
        quotes: { $first: "$quotes" },
    };
    pipeline.push(stage);

   return pipeline;

}

exports.getPipelineForClosingQuotes = getPipelineForClosingQuotes;


exports.getPipelineForDailyAverageQuotes = (symbols, marketQuoteDate) => {

    // let n = (n1 = 0) => (typeof n1 !== 'undefined') ? n1 : 0;

    //TD: Convert marketQuoteDate to UTC start and end instead of converting $quoteTime and then match
    //TD: store Trade Date and Time in IST

    //* User aggregation framework
    let stage = {};
    let pipeline = [];
    let $project = {};

    let pLFCQ = getPipelineForClosingQuotes(symbols, marketQuoteDate)

    pipeline.push(...pLFCQ);

// Liquid UL Only

    stage = {};
    $project = {};
    $project.marketQuoteDate = "$_id";
    $project.refreshTime = true;
    $project.marketQuoteTime = true;
    $project.quotes = {};
    $project.quotes.$filter = {
        input: "$quotes",
        as: "quote",
        cond: {}
    }
    $project.quotes.$filter.cond.$and = [];

    if (symbols.length > 0) {
        $project.quotes.$filter.cond.$and.push({ $in: ["$$quote.symbol", symbols] });
    }

    $project.quotes.$filter.cond.$and.push({
        $or: [
            { $gte: ["$$quote.trdVol", 40] }, //40 avg for 212 symbols. 6 trading hours
            { $gte: ["$$quote.ntP", 100] }, ////100 avg for 212 symbols
        ]
    });

    // $project.quotes.$filter.cond.$and.push({
    //     $or: [
    //         { $gt: ["$$quote.expectedHighPercent", 0] },
    //         { $gt: ["$$quote.expectedLowPercent", 0] }
    //     ]
    // });

    // $project.quotes.$filter.cond.$and.push({
    //     $or: [
    //         { $gt: ["$$quote.expectedHighPercent", 0] },
    //         { $gt: ["$$quote.expectedLowPercent", 0] }
    //     ]
    // });

    // $project.quotes.$filter.cond.$and.push({ $gt: ["$$quote.maxROC", 0]});

//UL with Liquid Options
    $project.quotes.$filter.cond.$and.push({
        $or: [
            { $lt: ["$$quote.expectedHighOptions.call.bidAskSpr", 15] },
            { $lt: ["$$quote.expectedLowOptions.put.bidAskSpr", 15] }
        ]
    });

    stage.$project = $project
    pipeline.push(stage);

    let aQSToPL = getPipelineForQuoteSummary();

    pipeline.push(...aQSToPL);

    pipeline.push({ $sort: { marketQuoteDate: 1 } });

    return pipeline;

}

// db.quotes.find({"refreshTime" : {$gte : ISODate("2017-11-06T10:41:52.403Z")}},{quotes : {$elemMatch : {maxROC : 0}}}).sort({_id : -1}).pretty();


// load("market-watcher/server/api/quote/quote.queries.js"); */



function getPipelineForQuoteSummary() {
    let stage = {};
    let pipeline = [];
    let $project = {};

    stage = {};
    $project = {};
    $project._id = true;
    // $project.marketQuoteDate = true;
    $project.refreshTime = true;
    $project.marketQuoteTime = true;
    // $project.quotes = true;

    $project.totalSymbols = { $size: '$quotes.symbol' },
        $project.avgVol = { $avg: '$quotes.trdVol' },
        $project.avgTO = { $avg: '$quotes.ntP' },
        $project.avgMaxROC = { $avg: ({ $max: ["$quotes.expectedHighCallROCPercent" || 0, "$quotes.expectedLowPutROCPercent" || 0] }) || 0 },
        $project.avgExpHiPer = { $avg: '$quotes.expectedHighPercent' },
        $project.avgExpLoPer = { $avg: '$quotes.expectedLowPercent' },
        $project.avgCallBA = { $avg: '$quotes.expectedHighOptions.call.bidAskSpr' },
        $project.avgPutBA = { $avg: '$quotes.expectedLowOptions.put.bidAskSpr' },
        $project.avgCallIV = { $avg: '$quotes.expectedHighOptions.call.iv' },
        $project.avgPutIV = { $avg: '$quotes.expectedLowOptions.put.iv' },
        $project.avgCallOI = { $avg: '$quotes.expectedHighOptions.call.oi' },
        $project.avgPutOI = { $avg: '$quotes.expectedLowOptions.put.oi' },

        stage.$project = $project;
        pipeline.push(stage);

   return pipeline;

}


exports.getPipelineForClosingQuotesWithSummary = (symbols, marketQuoteDate) => {

    let stage = {};
    let pipeline = [];
    let $project = {};

    let pLCQ = getPipelineForClosingQuotes(symbols, marketQuoteDate);
    let aQSToPL = getPipelineForQuoteSummary();

   return [...pLCQ,...aQSToPL];

}

