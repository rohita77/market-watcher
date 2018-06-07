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
                $subtract: ["$strikes.price", symbolLtp]
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
        in : { $subtract: [ "$$strike.price", 960] } //,
        //in : { "$$strike.call" : true}
    }
    */
    //pipeline.push(stage);

    // Stage 2.2 Sort by moneyness
    stage = {};
    stage.$sort = { moneyness: 1, "strikes.price": 1 };
    pipeline.push(stage);

    // Stage 3 ATM Option is the nearest option
    stage = { $group: {} };
    stage.$group = {
        _id: "$symbol",
        ATMOption: { $first: "$strikes" },
        strikes: {
            $addToSet: {
                moneyness: "$moneyness",
                perSpot : "$strikes.perSpot",
                price: "$strikes.price",
                call: "$strikes.call",
                put: "$strikes.put"
            }
        }
    }
    pipeline.push(stage);

    // Stage 4 NTM Option is the next nearest option
    pipeline.push({ $unwind: "$strikes" });
    pipeline.push({ $sort: { "strikes.moneyness": 1, "strikes.price": 1 } });
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
                price: "$strikes.price",
                perSpot : "$strikes.perSpot",
                call: "$strikes.call",
                put: "$strikes.put"
            }
        }
}
    pipeline.push(stage);

    // Stage 5  expected High and Low (half SD)
    stage = {};
    stage.$project = {
        _id: false,
        symbol: "$_id.symbol",
        ATMOption: "$_id.ATMOption",
        NTMOption: true,
        expectedHigh: { $max: ["$_id.ATMOption.call.be", "$NTMOption.call.be"] },
        expectedLow: { $min: ["$_id.ATMOption.put.be", "$NTMOption.put.be"] },
        strikes: true
    };
    pipeline.push(stage);

    // Stage 5A  expected High and Low (One SD)
    stage = {};
    stage.$addFields = {
        expHiHlfSD : "$expectedHigh",
        expLoHlfSD : "$expectedLow",
        expHiOneSD: { $add: ["$expectedHigh", {$subtract : [symbolLtp, "$expectedLow"] }] },
        expLoOneSD: { $subtract: ["$expectedLow", {$subtract : ["$expectedHigh",symbolLtp] }] },
    };
    pipeline.push(stage);

    // Stage 6  Liquid OTM strikes beyond expected move
    stage = {};
    stage.$addFields = {
        strikesAboveExpectedHigh: {

            $filter: {
                input: "$strikes",
                as: "strike",
                cond: {
                    $and: [
                        { $gte: ["$$strike.price", "$expHiHlfSD"] },
                        { $lt: ["$$strike.price", "$expHiOneSD"] },
                        { $and: [{ $gt: ["$$strike.call.bid", 0] },{ $gte: ["$$strike.call.vol", 1] }, { $gte: ["$$strike.call.oi", 1] }] },
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
                        { $lte: ["$$strike.price", "$expLoHlfSD"] },
                        { $gt: ["$$strike.price", "$expLoOneSD"] },
                        { $and: [{ $gt: ["$$strike.put.bid", 0] },{ $gte: ["$$strike.put.vol", 1] }, { $gte: ["$$strike.put.oi", 1] }] },
                    ]
                }
            }
        },

        strikesAboveExpHiOneSD: {

            $filter: {
                input: "$strikes",
                as: "strike",
                cond: {
                    $and: [
                        { $gte: ["$$strike.price", "$expHiOneSD"] },
                        { $and: [{ $gt: ["$$strike.call.bid", 0] },{ $gte: ["$$strike.call.vol", 1] }, { $gte: ["$$strike.call.oi", 1] }] },
                    ]
                }
            }
        },
        strikesBelowExpLoOneSD: {
            $filter: {
                input: "$strikes",
                as: "strike",
                cond: {
                    $and: [
                        { $lte: ["$$strike.price", "$expLoOneSD"] },
                        { $and: [{ $gt: ["$$strike.put.bid", 0] },{ $gte: ["$$strike.put.vol", 1] }, { $gte: ["$$strike.put.oi", 1] }] },
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
                        $eq: ["$$strike.price", { $min: "$strikesAboveExpectedHigh.price" }]
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
                        $eq: ["$$strike.price", { $max: "$strikesBelowExpectedLow.price" }]
                    }
                }
            }, 0]
        },
        firstStrikeAboveExpHiOneSD: {
            $arrayElemAt: [{
                $filter: {
                    input: "$strikes",
                    as: "strike",
                    cond: {
                        $eq: ["$$strike.price", { $min: "$strikesAboveExpHiOneSD.price" }]
                    }
                }
            }, 0]
        },
        firstStrikeBelowExpLoOneSD: {
            $arrayElemAt: [{
                $filter: {
                    input: "$strikes",
                    as: "strike",
                    cond: {
                        $eq: ["$$strike.price", { $max: "$strikesBelowExpLoOneSD.price" }]
                    }
                }
            }, 0]
        }

    }

    pipeline.push(stage);

    // Stage 7  Projeject Only what is required
    stage = {};
    stage.$project = {
        '_id': false,
        symbol: true,
        ATMOption: true,
        NTMOption: true,
        strikesAboveExpectedHigh : true,
        strikesBelowExpectedLow : true,
        strikesAboveExpHiOneSD : true,
        strikesBelowExpLoOneSD : true,

        expectedHigh: true,
        expectedLow: true,
        expectedHighOptions: '$firstStrikeAboveExpectedHigh',
        expectedLowOptions: '$firstStrikeBelowExpectedLow',
        expHiHlfSD : { price : '$expHiHlfSD',
            nextStrike : {
                price : '$firstStrikeAboveExpectedHigh.price',
                perSpot : '$firstStrikeAboveExpectedHigh.perSpot'},
            nextCall : '$firstStrikeAboveExpectedHigh.call'},
        expLoHlfSD : { price : '$expLoHlfSD',
            nextStrike : {
                price : '$firstStrikeBelowExpectedLow.price' ,
                perSpot : '$firstStrikeBelowExpectedLow.perSpot'},
            nextPut : '$firstStrikeBelowExpectedLow.put'},
        expHiOneSD : { price : '$expHiOneSD',
            nextStrike : {
                price : '$firstStrikeAboveExpHiOneSD.price'  ,
                perSpot : '$firstStrikeAboveExpHiOneSD.perSpot'},
            nextCall : '$firstStrikeAboveExpHiOneSD.call'},
        expLoOneSD : { price : '$expLoOneSD',
            nextStrike : {
                price : '$firstStrikeBelowExpLoOneSD.price'  ,
                perSpot : '$firstStrikeBelowExpLoOneSD.perSpot'},
            nextPut : '$firstStrikeBelowExpLoOneSD.put'}
    }

    pipeline.push(stage);


  return pipeline;

}


