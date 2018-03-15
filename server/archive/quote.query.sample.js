db.quotes.aggregate([
    { "$addFields": { "marketQuoteTime": { "$add": ["$quoteTime", 19800000] } } },
    { "$addFields": { "marketQuoteDate": { "$dateToString": { "format": "%G%m%d", "date": "$marketQuoteTime" } } } },
    { "$sort": { "marketQuoteTime": -1 } },
    { "$project":
                { "marketQuoteDate": true}
    },

    { "$match": { "marketQuoteDate": "20180212" } },
    { "$skip": 1 },
    { "$group":
        { "_id": "$marketQuoteDate",
        "marketQuoteTime": { "$first": "$marketQuoteTime" },
        "refreshTime": { "$first": "$refreshTime" },
        "quoteTime": { "$first": "$quoteTime" },
        "quotes": { "$first": "$quotes" }  ,
    } },
    { "$project":
                { "marketQuoteDate": "$_id",
                    "refreshTime": true,
                    "marketQuoteTime": true,
                    "callQuotes": {
                        "$filter":
                        { "input": "$quotes", "as": "quote", "cond":
                        { "$and":
                        [
                            { "$or": [{ "$gte": ["$$quote.trdVol", 40] }, { "$gte": ["$$quote.ntP", 100] }] },
                            { "$and": [{ "$lt": ["$$quote.expectedHighOptions.call.bidAskSpread", 15] },
                            { "$gt": ["$$quote.expectedHighOptions.put.bidAskSpread", 15] }] }] } } }  ,
                    "putQuotes": {
                        "$filter":
                        { "input": "$quotes", "as": "quote", "cond":
                        { "$and":
                        [
                            { "$or": [{ "$gte": ["$$quote.trdVol", 40] }, { "$gte": ["$$quote.ntP", 100] }] },
                            { "$and": [{ "$lt": ["$$quote.expectedLowOptions.put.bidAskSpread", 15] },
                            { "$gt": ["$$quote.expectedLowOptions.put.bidAskSpread", 0] }] }] }
                         } } }},
    { "$project":
        { "_id": true,
        "refreshTime": true,
        "marketQuoteTime": true,
        // "totalSymbols": { "$size": "$Callquotes.symbol" },
        // "avgVol": { "$avg": "$quotes.trdVol" },
        // "avgTurnover": { "$avg": "$quotes.ntP" },
        "avgMaxROC": { "$avg": { "$max": ["$cllQuotes.expectedHighCallROCPercent", "$putQuotes.expectedLowPutROCPercent"] } },
        "avgExpHiPer": { "$avg": "$callQuotes.expectedHighPercent" },
        "avgExpLowPer": { "$avg": "$putQuotes.expectedLowPercent" },
        "avgCallBA": { "$avg": "$callQuotes.expectedHighOptions.call.bidAskSpread" },
        "avgPutBA": { "$avg": "$putQuotes.expectedLowOptions.put.bidAskSpread" },
        "avgCallIV": { "$avg": "$callQuotes.expectedHighOptions.call.iv" },
        "avgPutIV": { "$avg": "$putQuotes.expectedLowOptions.put.iv" },
        "avgCallOI": { "$avg": "$callQuotes.expectedHighOptions.call.oi" },
        "avgPutOI": { "$avg": "$putQuotes.expectedLowOptions.put.oi" } ,
        // "symbols" :  "$quotes.symbol",
        "callBA" :  "$callQuotes.expectedHighOptions.call.bidAskSpread",
        "putBA" :  "$putQuotes.expectedLowOptions.put.bidAskSpread"

    } },
    { "$sort": { "marketQuoteDate": 1 },
    }]);