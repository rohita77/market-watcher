'use strict'

export function getPiplelineForOCSubset(passedSymbol, ltP) {

    //* User aggregation framework
    let stage = {};
    let pipeline = [];
    let symbol = passedSymbol || 'RELIANCE';
    let symbolLtp = ltP || 1615 //1570, 940.3

    //* Stage 1: Get Latest Chain for Symbol
    stage.$match = {}
    stage.$match.symbol = symbol;
    pipeline.push(stage);
    pipeline.push({ $sort: { lastMod: -1 } });
    pipeline.push({ $limit: 1 });

    // Stage 2:Find Nearest Options
    // Stage 2.1 Calculate Nearest

    pipeline.push({ $unwind: "$strikes" });

    stage = {};
    stage.$addFields = {
        moneyness: {
            $abs: {
                $subtract: ["$strikes.strikePrice", symbolLtp]
            }
        }
    };
    pipeline.push(stage);

    /* Array operators ...instead of unwind */
    /*stage = {}
    stage.$project = {}
    stage.$project._id = false;
    stage.$project.symbol = true;
    stage.$project.strikes = {}
    stage.$project.strikes.$map = {
        input: "$strikes",
        as : "strike",
        in : { $subtract: [ "$$strike.strikePrice", 960] } //,
        //in : { "$$strike.call" : true}
    }
    */
    //pipeline.push(stage);

    // Stage 2.2 Sort by moneyness
    stage = {};
    stage.$sort = { moneyness: 1, "strikes.strikePrice": 1 };
    pipeline.push(stage);

    // Stage 3 ATM Option is the nearest option
    stage = { $group: {} };
    stage.$group = {
        _id: "$symbol",
        ATMOption: { $first: "$strikes" },
        strikes: {
            $addToSet: {
                moneyness: "$moneyness",
                strikePrice: "$strikes.strikePrice",
                call: "$strikes.call",
                put: "$strikes.put"
            }
        }
    }
    pipeline.push(stage);

    // Stage 4 NTM Option is the next nearest option
    pipeline.push({ $unwind: "$strikes" });
    pipeline.push({ $sort: { "strikes.moneyness": 1, "strikes.strikePrice": 1 } });
    pipeline.push({ $skip: 1 });

    stage = { $group: {} };
    stage.$group = {
        _id: {
            symbol: "$_id",
            ATMOption: "$ATMOption",
        },

        NTMOption: { $first: "$strikes" },
        strikes: {
            $addToSet: {
                strikePrice: "$strikes.strikePrice",
                call: "$strikes.call",
                put: "$strikes.put"
            }
        }
    }
    pipeline.push(stage);

    // Stage 5  expected High and Low
    stage = {};
    stage.$project = {
        _id: false,
        symbol: "$_id.symbol",
        ATMOption: "$_id.ATMOption",
        NTMOption: true,
        expectedHigh: { $max: ["$_id.ATMOption.call.breakEven", "$NTMOption.call.breakEven"] },
        expectedLow: { $min: ["$_id.ATMOption.put.breakEven", "$NTMOption.put.breakEven"] },
        strikes: true
    };
    pipeline.push(stage);


    // Stage 6  Liquid OTM strikes beyonnd expected move
    stage = {};
    stage.$addFields = {
        strikesAboveExpectedHigh: {

            $filter: {
                input: "$strikes",
                as: "strike",
                cond: {
                    $and: [
                        { $gte: ["$$strike.strikePrice", "$expectedHigh"] },
                        { $and: [{ $gte: ["$$strike.call.volume", 1] }, { $gte: ["$$strike.call.oi", 1] }] },
                    ]
                }
            }
        },
        strikesBelowExpectedLow: {
            $filter: {
                input: "$strikes",
                as: "strike",
                cond: {
                    $and: [
                        { $lte: ["$$strike.strikePrice", "$expectedLow"] },
                        { $and: [{ $gte: ["$$strike.put.volume", 0] }, { $gte: ["$$strike.put.oi", 0] }] },
                    ]
                }
            }
        }
    };
    pipeline.push(stage);


    // Stage 6  First Liquid OTM strikes beyonnd expected move
    stage = {};
    stage.$addFields = {
        firstStrikeAboveExpectedHigh: {
            $arrayElemAt: [{
                $filter: {
                    input: "$strikes",
                    as: "strike",
                    cond: {
                        $eq: ["$$strike.strikePrice", { $min: "$strikesAboveExpectedHigh.strikePrice" }]
                    }
                }
            }, 0]
        },
        firstStrikeBelowExpectedLow: {
            $arrayElemAt: [{
                $filter: {
                    input: "$strikes",
                    as: "strike",
                    cond: {
                        $eq: ["$$strike.strikePrice", { $max: "$strikesBelowExpectedLow.strikePrice" }]
                    }
                }
            }, 0]
        }
    }

    pipeline.push(stage);

  return pipeline;

};


