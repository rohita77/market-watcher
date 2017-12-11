//'use strict'

export function getPipelineForDailyAverageQuotes(symbols,marketQuoteDate) {

    // let n = (n1 = 0) => (typeof n1 !== 'undefined') ? n1 : 0;

    //* User aggregation framework
    let stage = {};
    let pipeline = [];
    let $project = {};
    const ISTOffset = 5.5 * 60 * 60000;

    stage.$addFields = {
        marketQuoteTime: {
            $add: ["$quoteTime",ISTOffset]
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
        pipeline.push({$match : {
            marketQuoteDate : marketQuoteDate
        }});
        pipeline.push({$skip : 1});
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
        quotes: { $first: "$quotes"},
    };
    pipeline.push(stage);

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

    if (symbols.length > 0 ) {
        $project.quotes.$filter.cond.$and.push({ $in :["$$quote.symbol", symbols] });
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

    $project.quotes.$filter.cond.$and.push({
        $or: [
            { $lt: ["$$quote.expectedHighOptions.call.bidAskSpread", 15] },
            { $lt: ["$$quote.expectedLowOptions.put.bidAskSpread", 15] }
        ]
    });

    stage.$project = $project
    pipeline.push(stage);

    stage = {};
    $project = {};
    $project._id = true;
    // $project.marketQuoteDate = true;
    $project.refreshTime = true;
    $project.marketQuoteTime = true;
    // $project.quotes = true;

    $project.totalSymbols= { $size: '$quotes.symbol'},
    $project.avgVol= { $avg: '$quotes.trdVol'},
    $project.avgTurnover= { $avg: '$quotes.ntP'},
    $project.avgMaxROC= { $avg: ({ $max: ["$quotes.expectedHighCallROCPercent" || 0, "$quotes.expectedLowPutROCPercent" || 0] }) || 0},
    $project.avgExpHiPer= { $avg: '$quotes.expectedHighPercent'},
    $project.avgExpLowPer= { $avg: '$quotes.expectedLowPercent'},
    $project.avgCallBA= { $avg: '$quotes.expectedHighOptions.call.bidAskSpread'},
    $project.avgPutBA= { $avg: '$quotes.expectedLowOptions.put.bidAskSpread'},
    $project.avgCallIV= { $avg: '$quotes.expectedHighOptions.call.iv'},
    $project.avgPutIV= { $avg: '$quotes.expectedLowOptions.put.iv'},
    $project.avgCallOI= { $avg: '$quotes.expectedHighOptions.call.oi'},
    $project.avgPutOI= { $avg: '$quotes.expectedLowOptions.put.oi'},

    stage.$project = $project;
    pipeline.push(stage);

    pipeline.push({ $sort: { marketQuoteDate: 1 } });

    return pipeline;

}

// db.quotes.find({"refreshTime" : {$gte : ISODate("2017-11-06T10:41:52.403Z")}},{quotes : {$elemMatch : {maxROC : 0}}}).sort({_id : -1}).pretty();


// load("market-watcher/server/api/quote/quote.queries.js"); */