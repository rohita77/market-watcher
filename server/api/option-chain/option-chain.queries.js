/* Calendar */
// load("server/api/option-chain/option-chain.queries.js")
/*
var tgtEarningDate = new Date();
tgtEarningDate.setDate(tgtEarningDate.getDate() + 1);
var  arrRes= db.boardmeetings.find({boardMeetingDate : {$lte : tgtEarningDate}}).toArray();
print(JSON.stringify(arrRes));
*/
var query = {};
var project = {}
var sort = {};
var limit = {};
var optPredicate;
var optQuery = {};

query.$or = [];

/*Symbols with good liquidity */

var optElemMatchQuery = {};

['call', 'put'].forEach((o) => {

    optElemMatchQuery = {};
    optElemMatchQuery[`${o}.percentSpread`] = { $lte: 10 };
    optElemMatchQuery[`${o}.oi`] = { $gte: 10 };  //1000
    optElemMatchQuery[`${o}.volume`] = { $gte: 1 }; //100
    //optElemMatchQuery[`${o}.chngInOI`] = { $gt: 0 }; //100
    // optElemMatchQuery[`${o}.iv`] = { $gte: 50 };
    //optElemMatchQuery[`${o}.netChng`] = { $gt: 0 };

    optQuery = {};
    optQuery.$elemMatch = optElemMatchQuery;
    query.$or.push({ 'strikes': optQuery });
})

query.symbol = "INFY";

//print(`Query: ${JSON.stringify(query)}`);

project.symbol = true;
project._id = false;
project.strikes = {};
project.strikes.$elemMatch = {};
//project.strikes.$elemMatch.$or = [];

['call', 'put'].forEach((o) => {

    optElemMatchQuery = {};
    optElemMatchQuery[`${o}.percentSpread`] = { $lte: 10 };
    optElemMatchQuery[`${o}.oi`] = { $gte: 10 };  //1000
    optElemMatchQuery[`${o}.volume`] = { $gte: 1 }; //100
    //optElemMatchQuery[`${o}.chngInOI`] = { $gt: 0 }; //100
    // optElemMatchQuery[`${o}.iv`] = { $gte: 50 };
    //optElemMatchQuery[`${o}.netChng`] = { $gt: 0 };

    optQuery = {}
    //optQuery.$or.push(optElemMatchQuery)
    //  project.strikes.$elemMatch.$or.push(optElemMatchQuery);
    project.strikes.$elemMatch.strikePrice = { $lte: 950 };
})

//print(`Project: ${JSON.stringify(project)}`);

sort.symbol = 1;

//var arrRes = db.optionchains.find(query).sort(sort).limit(200);
//print(`Docs returned : ${arrRes.toArray().length}`);
/*
arrRes.toArray().forEach((u) => {
    print(`Symbol: ${JSON.stringify(u.symbol)}`);
    print(`Strikes returned : ${u.strikes.length}`);
    u.strikes.forEach((s) => {
        print(`Strike: ${s.strikePrice}`);
        print(`Call: ${JSON.stringify(s.call)}`);
        print(`Put: ${JSON.stringify(s.put)}`);
    })
})
*/

//* User aggregation framework

var pipeline = [];
var stage = {};
var unwind = {};
var symbol = 'INFY';
var symbolLtp = 911.50; //1570, 911.50

stage.$match = {}
stage.$match.symbol = symbol;

stage.$match.symbol = symbol;


pipeline.push(stage);

pipeline.push({ $unwind: "$strikes" });

/*stage = {};
stage.$match = {};
stage.$match["strikes.strikePrice"] = {$gte : 960};

//pipeline.push(stage);*/

stage = {};
stage.$addFields = {
    nearness: {
        $abs: {
            $subtract: ["$strikes.strikePrice", symbolLtp] //1570, 911.50
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

stage = {};
stage.$project = {
    _id: false,
    symbol: "$symbol",
    strikePrice: "$strikes.strikePrice",
    nearness: "$nearness",
    call: {
        percentSpread: "$strikes.call.percentSpread",
        midPrice: "$strikes.call.midPrice",
        breakEven: "$strikes.call.breakEven",
        ltp: "$strikes.call.ltp",
        iv: "$strikes.call.iv",
        volume: "$strikes.call.volume",
        chngInOI: "$strikes.call.chngInOI",
        oi: "$strikes.call.oi",
    },
    put: {
        percentSpread: "$strikes.put.percentSpread",
        midPrice: "$strikes.put.midPrice",
        breakEven: "$strikes.put.breakEven",
        ltp: "$strikes.put.ltp",
        iv: "$strikes.put.iv",
        volume: "$strikes.put.volume",
        chngInOI: "$strikes.put.chngInOI",
        oi: "$strikes.put.oi",
    }
};
pipeline.push(stage);

stage = {};
stage.$sort = { nearness: 1, strikePrice: 1 };
pipeline.push(stage);

stage = { $group: {} };
stage.$group = {
    _id: "$symbol",
    ATMOption: {
        $first: {
            strikePrice: "$strikePrice",
            call: "$call",
            put: "$put"
        }
    },
    strikes: {
        $addToSet: {
            nearness: "$nearness",
            strikePrice: "$strikePrice",
            call: "$call",
            put: "$put"
        }
    }
}
pipeline.push(stage);

/*stage = {$project : {}};
stage.$project = {
    _id : true,
    ATMOption : true,
    NTMOption : { $arrayElemAt: [ "$strikes", 1 ] },
    strikes : true,
}
pipeline.push(stage);*/

pipeline.push({ $unwind: "$strikes" });

pipeline.push({ $sort: { "strikes.nearness": 1, "strikes.strikePrice": 1 } });

pipeline.push({ $skip: 1 });


stage = { $group: {} };
stage.$group = {
    _id: {
        symbol: "$_id",
        ATMOption: "$ATMOption",
    },

    NTMOption: {
        $first: {
            strikePrice: "$strikes.strikePrice",
            call: "$strikes.call",
            put: "$strikes.put"
        }
    },
    strikes: {
        $addToSet: {
            strikePrice: "$strikes.strikePrice",
            call: "$strikes.call",
            put: "$strikes.put"
        }
    }
}
pipeline.push(stage);

print(JSON.stringify(pipeline));

stage = {};
stage.$project = {
    _id: false,
    symbol: "$_id.symbol",
    ATMOption: "$_id.ATMOption",
    NTMOption: true,
    expectedHigh : {$cond: { if: { $gte: [ "$_id.ATMOption.call.breakEven", "$NTMOption.call.breakEven" ] }, then: "$_id.ATMOption.call.breakEven", else: "$NTMOption.call.breakEven" }},
    expectedLow : {$cond: { if: { $lte: [ "$_id.ATMOption.put.breakEven", "$NTMOption.put.breakEven" ] }, then: "$_id.ATMOption.put.breakEven", else: "$NTMOption.put.breakEven" }},
    strikes: {

        $filter: {
            input: "$strikes",
            as: "strike",
            cond: {
                $or : [
                    { $and : [ {$gte : ["$$strike.call.volume", 1]},{$gte : ["$$strike.call.chngInOI", 0]} ]},
                    {$and : [ {$gte : ["$$strike.put.volume", 1]},{$gte : ["$$strike.put.chngInOI", 0]} ]},
                ]
            }
        }
    }
};
pipeline.push(stage);

stage = {};
stage.$project = {
    _id: false,
    symbol: true,
    ATMOption: true,
    NTMOption: true,
    expectedHigh : true,
    expectedLow : true,
    percentExpectedHigh : {$divide : [{$subtract: [ "$expectedHigh", symbolLtp ] } ,symbolLtp]},
    percentExpectedLow :  {$divide : [{$subtract: [ symbolLtp,"$expectedLow" ] } ,symbolLtp]},
    strikes: true
};
pipeline.push(stage);


print('*****************************************************************************************************************************************************');
var arrRes = db.optionchains.aggregate(pipeline);

arrRes.toArray().forEach((u) => {
    print(`${JSON.stringify(u.symbol)} Exp High: ${JSON.stringify(u.expectedHigh)} Exp Low: ${JSON.stringify(u.expectedLow)}  Exp High%: ${JSON.stringify(u.percentExpectedHigh)} Exp Low%: ${JSON.stringify(u.percentExpectedLow)}`);
    print('>>>>>>>>>>>>');

    print(`ATM: ${JSON.stringify(u.ATMOption)}`);
    print(`NTM: ${JSON.stringify(u.NTMOption)}`);
    u.strikes.forEach((s) => {
        print('-----------------------------------------------------------------------------------------------------------------------------------------------');
        print(`${s.strikePrice}, C:${JSON.stringify(s.call)}  `);
        print(`${s.strikePrice}, P:${JSON.stringify(s.put)}  `);
    })

})

/*Call: {"percentSpread":71.43,"midPrice":0.22,
"breakEven":1300.22,"netChng":-0.3,"ltp":0.1,"iv":90.71,"volume":2,"chngInOI":-500,"oi":44000}*/