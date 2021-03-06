//node dist/server/batchApp.job

'use strict';
var _ = require('lodash');
//import NSEDataAdapter from '../../components/nsedata/index'; //TD:
var NSEDataAdapter = require('../../components/nse-data-adapter/index'); //TD Refactor
var moment = require('moment');

//import Core Model and save to Mongo
var Watchlist = require( './watchlist.model');

var Symbol = require( './../../api/symbol/symbol.model');

var boardMeeting = require( '../../api/board-meeting/board-meeting.model');

var FnOMktLot = require( '../../components/nse-data-adapter/models/fno-mkt-lot.model');

//var Quote Model and save to Mongo
var Quote = require( '../../api/quote/quote.model');
var OptionChain = require( '../../api/option-chain/option-chain.model');
var DailyStat = require( '../../api/daily-stat/daily-stat.model');

function now() {
    return moment().format('HH:mm:ss Z');
}

const Readable = require('stream').Readable
const stream = new Readable({
    objectMode: true,
    read() {},
    autoDestroy : true
  })

function log(message) {

    console.log(`${now()} ${message}`);
    let json = {}
    json[`${now()}`] = `${message}`
    if (stream.readableFlowing) stream.push(json);
}

exports.run = () => {
    log("Watch List Job Fired");
    // return
        refreshWatchlists()
        .then(() => log(`Finished Refreshing Watchlists`))
        .then(() => refreshAllBoardMeetings())
        .then(() => log(`Finished Refreshing Board Meetings for symbols`))
        .then(() => refreshFnOLotSize())
        .then(() => log(`Finished Refreshing FnO Lot Sizes`))
        .then(() => updateSymbolsFromWatchlists())
        .then(() => log(`Finished Updating Symbols for Watchlists`))
        .then(() => {

            let today = moment().clone().startOf('day');
            if (today.isoWeekday() > 5) today.isoWeekday(5); //Friday
            return OptionChain.deleteMany({ lastMod: { $lt: today.toDate() } });
        })
        .then((result) => log(`Removed Option Chains ${JSON.stringify(result)}`))
        .then(() => archiveQuotes())
        .then((result) => log(`Archived quotes ${JSON.stringify(result)}`))
        .then(() => updateDailyAverageQuotes())
        .then(() => {
            //Compute Closing Quote for each option
            //Store quotes for last 30 days
        })
        .then(() => Symbol.find({}).countDocuments().exec().then((c) => {
            const msg = `After Job DB has ${JSON.stringify(c)} symbols`;
            log(msg);
            stream.push(null);
        }))

    return stream;
}

function refreshWatchlists() {
    //Iterate through 'watchlists' and get symbols
    return Watchlist.find().exec()
        .then(watchlists => refreshEachWatchlist(watchlists));
}

function refreshEachWatchlist(watchlists) {

    //Return a Promise that is resolved when the promise for each watchlist is resolved
    return Promise.all(
        watchlists.map(watchlist => {

            //Promise for each watchlist that is resolved when the symbols are retrieved and saved
            return NSEDataAdapter.getSymbolsInWatchList(watchlist)
                //save the symbols in the watchlist once they are downloaded
                .then(symbols => {
                    log(`Fetched Watchlist ${watchlist.name} / ${watchlist.downloadKey} with ${symbols.length} symbols`);
                    watchlist.symbols = symbols;
                    return watchlist.save();
                })
                //resolve the promise for the watchlist once its saved
                .then((e, r) => {
                    log(`Saved Watchlist ${watchlist.name} / ${watchlist.downloadKey} with ${e.symbols.length} symbols `);
                });

        }));

}

//Create/Update symbols and their associate watchlist in DB using unique list of symbols from all watchlists
function updateSymbolsFromWatchlists() {
    //Transpose to get unique list of symbols and associated watchlists
    let pipleline = [
        { $unwind: "$symbols" },
        {
            $group: {
                '_id': "$symbols.symbol",

                "watchlists": {
                    "$addToSet": "$_id"
                },
                "symbol" : {"$first" :"$symbols"}

            }
        },
        {
            $project: {
                "_id": "$symbol._id",
                symbol: "$symbol.symbol",
                name: "$symbol.name",
                industry: "$symbol.industry",
                market: "$symbol.market",
                watchlists: 1
            }
        }];

    log(`Firing Symbol saves`);

    return Watchlist.aggregate(pipleline)
        //    .limit(2)
        .exec()
        .then(symbols => updateEachSymbolFromWatchlists(symbols));

}

function updateEachSymbolFromWatchlists(symbols) {
    let symbol_ids = ['zzzz'];

    return Promise.all(
        //Save list of symbols
        symbols.map(symbolDoc => {

            //Update symbols only once even if it is present in multiple watch lists

            if (symbol_ids.find(s => s.match(symbolDoc._id)))
                return Promise.resolve(); //Null in array
            else
                symbol_ids.push(symbolDoc._id);

            return Promise.all([

                //Move to Board Meetings
                //Tag Board Meetings with Watchlists

                updateBoardMeetingsWithWatchlist(symbolDoc), //Group Promises
                updateSymbol(symbolDoc)
            ])
        })
    )
}

function populateEarnings(earningPeriod, symbolDoc) {
    /* Next Earning Date */

    let query = {};
    let sort = {};

    //let tgtEarningDate = new Date();
    //tgtEarningDate.setDate(tgtEarningDate.getDate() - 1); // Trime Date

    let tgtEarningDate = moment().clone().startOf('day').toDate();
    //log(`${earningPeriod} for ${symbolDoc.symbol} from ${tgtEarningDate}`);

    query.boardMeetingDate = {};

    let op = (earningPeriod === 'previousEarnings') ? '$lt' : '$gte';

    query.boardMeetingDate[op] = tgtEarningDate;
    query.purpose = /Results/;

    let sortOrder = (earningPeriod ==='previousEarnings') ? -1 : 1;
    sort.boardMeetingDate = sortOrder * 1; // Latest or Next
    sort.purpose = 1; // Alway 'Results' before 'Results*'

    query.symbol = symbolDoc.symbol;

    return boardMeeting.find(query).sort(sort).limit(1).exec()
        .then(bM => {
            symbolDoc[earningPeriod] = bM[0] ? bM[0].boardMeetingDate : symbolDoc[earningPeriod]; //Retain Previous value if new one is not there
            if (symbolDoc.symbol ==="HINDALCO")
                log(`${earningPeriod} for ${symbolDoc.symbol} is ${symbolDoc[earningPeriod]}`);
            return symbolDoc;
        });
}


function populateFnOMktLot(symbolDoc) {
    /* Next Earning Date */

    let query = {};

    let frontMonth = NSEDataAdapter.getFrontMonthExpiryDate(moment(), "MMM-YY");

    query.symbol = symbolDoc.symbol;

    return FnOMktLot.findOne(query).exec()
        .then(fML => {
            if (fML) {
                symbolDoc.frontMonthLotSize = fML.mktlot[frontMonth.toUpperCase()]; //TD: get Calendar Month for Front Month
            }

            if (symbolDoc.symbol ==="HINDALCO")
                log(`Lot Size for ${symbolDoc.symbol} for frontMonth ${frontMonth} is ${symbolDoc.frontMonthLotSize}`);
            return symbolDoc;
        });
}

function updateSymbol(symbolDoc) {

    return Symbol.findById(symbolDoc._id)
        .exec()
        //If symbol does not exist in DB, create Symbol Model from symbol in watchlist
        .then(aSymbol => aSymbol ? aSymbol : new Symbol(symbolDoc))
        //Update previous Earnings Date
        .then(pSymbol => populateEarnings('previousEarnings', pSymbol))
        //Update next Earnings Date
        .then(nSymbol => populateEarnings('nextEarnings', nSymbol))

        //project earnings
        .then(eSymbol => {
            //Earnings recently anounced
            if (eSymbol.nextEarnings && (eSymbol.nextEarnings < new Date())) { //TD: Trim to the date only and compare
                eSymbol.previousEarnings = eSymbol.nextEarnings;
                eSymbol.nextEarnings = null;
                //log(`previousEarnings for ${eSymbol.symbol} is ${eSymbol.previousEarnings}`);
                //log(`nextEarnings for ${eSymbol.symbol} is ${eSymbol.nextEarnings}`);
            }

            // log(`Earnings for ${eSymbol.symbol} is Prev: ${eSymbol.previousEarnings} Next: ${eSymbol.nextEarnings}`);

            if (eSymbol.previousEarnings) {

                let quarterFromPreviousEarnings = moment(eSymbol.previousEarnings).clone().add(1, 'quarters');
                eSymbol.projectedEarnings = (eSymbol.nextEarnings ===null) ? quarterFromPreviousEarnings.toDate() || null : eSymbol.nextEarnings;
                // log(`projectedEarnings for ${eSymbol.symbol} is ${eSymbol.projectedEarnings}`);

            }
            else {
                log(`Previous Earnings not available for ${eSymbol.symbol}`);
                eSymbol.projectedEarnings = null;

            }

            let frontMonthExpiryDate = NSEDataAdapter.getFrontMonthExpiryDate(moment());

            eSymbol.nextEarningsBeforeFrontMonthExpiry = (eSymbol.nextEarnings ===null) ? (eSymbol.projectedEarnings <= frontMonthExpiryDate) : (eSymbol.nextEarnings <= frontMonthExpiryDate)

            //TD: check if weekday?

            return eSymbol;

        })
        //Update Market Lots
        .then(fSymbol => populateFnOMktLot(fSymbol))

        //Update new/existing symbol model using symbol from watchlist
        .then(zSymbol => {
            return _.merge(zSymbol, symbolDoc)
                .save((e, r) => e ? log(`error: ${JSON.stringify(e)}`) : null
                )
        })


}

function updateBoardMeetingsWithWatchlist(symbolDoc) {
    return boardMeeting.updateMany(
        { 'symbol': symbolDoc.symbol },
        { 'watchlists': symbolDoc.watchlists }
    ).exec()

}
//TD:
function refreshAllBoardMeetings() {
    return Promise.all([
        refreshBoardMeetingsFor('past'),
        refreshBoardMeetingsFor('forthcoming')
    ])
}

function refreshFnOLotSize() {

    let download = NSEDataAdapter.getFnOLotSizes

    return FnOMktLot.deleteMany({}).exec()
        .then(() => download())
        .then((bmArr) => {
            log(`Retrieved ${bmArr.length} lot sizes`)
            return FnOMktLot.insertMany(bmArr);
        })
        .then((docs, e) => {
            log(`Inserted ${docs.length} lot sizes ${e || "no" } errors`);
        })

}

function refreshBoardMeetingsFor(timeframe) {

    //let tgtBoardMeetingDate = new Date();
    //tgtBoardMeetingDate.setDate(tgtBoardMeetingDate.getDate() - 1); //TD: Timezone //TD:Trim Date?

    let tgtBoardMeetingDate = new Date(moment().clone().startOf('day'));
    log(`Downloading ${timeframe} meeting from ${tgtBoardMeetingDate}`);

    let query = {};
    query.boardMeetingDate = {};

    let op = (timeframe ==='past') ? '$lt' : '$gte';
    let download = (timeframe ==='past') ? NSEDataAdapter.getBoardMeetingsForLast3Months : NSEDataAdapter.getFCBoardMeetings;

    query.boardMeetingDate[op] = tgtBoardMeetingDate;

    return boardMeeting.deleteMany(query).exec()
        .then(() => download())
        .then((bmArr) => {
            log(`Retrieved ${bmArr.length} ${timeframe} meetings`)
            return boardMeeting.insertMany(bmArr);
        })
        .then((docs, e) => {
            log(`Inserted ${docs.length} ${timeframe} meetings with ${e || "no" } errors`);
        })
    //            .then(bmArr => reduceBoardMeetingsArr(bmArr))
    //            .then(bmArr => console.log(bmArr))
    // .then(bmArr => console.log(`Reduced to forthcoming meetings to ${bmArr} entries`))
    /*
            boardMeeting.findById().exec()
                .then(refreshEachWatchlist())
                .then(() => resolve())
    */

}


//TD: Not used
function reduceBoardMeetingsArr(bmArr) {
    return bmArr.reduce((acc, rCV, rCI) => {
        //Find symbol and date in Accumulator Array

        let facc = acc.find((fCV, fCI) => {
            return (fCV.symbol ===rCV.symbol) && (fCV.boardMeetingDate ===rCV.boardMeetingDate);

        });

        //Push if not not found
        if (!facc) {
            facc = {};
            facc.symbol = rCV.symbol;
            facc.boardMeetingDate = rCV.boardMeetingDate;

            let purpose = [];
            purpose.push(rCV.purpose);
            facc.purpose = purpose;

            acc.push(facc);
        }
        //Else only push purpose
        else
            facc.purpose.push(rCV.purpose);

        return acc;
    }, []);
}

function updateDailyAverageQuotes() {

    //TD: pass date
    let today = moment().clone().utcOffset("+05:30");
    if (today.isoWeekday() > 5) today.isoWeekday(5); //Friday
    let dt = today.format("YYYYMMDD");

    return Quote.getDailyQuoteStats([],dt)
        .exec()
        .then((docs, err) => {
            return docs[0] ? docs[0] : undefined
        } )
        .then((quoteStat) => {
            if (quoteStat) {
                let qs = quoteStat;
                qs._id = undefined;
                log(JSON.stringify(qs));

                return DailyStat.findOneAndUpdate({ _id: dt }, {$set : {quotestats : qs }}, { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true, runSettersOnQuery: true })
                    .exec()
                    .then((doc, err) => {
                        log(`Upserted Daily average quotes for date: ${dt}`);
                        if (err) log(err); //undefined
                        return doc;
                    });

            }
        })

}

function archiveQuotes() {

    let lastMonthExpiryDate = NSEDataAdapter.getPreviousMonthExpiryDate();

    //TD: Retain Last quote of the day
    log(`Archiving quotes older than previous month expiry date ${moment(lastMonthExpiryDate).format()}`);

    return Quote.deleteMany({ lastMod: { $lt: lastMonthExpiryDate } });
}

/* Use these script to setup Insert Wachlists
db.watchlists.insert({_id: 'NIFTY50' , name : 'NIFTY 50 Index' , description : 'Nifty 50 Index',downloadKey : 'nifty50list'});
db.watchlists.insert({_id: 'NIFTY100' , name : 'NIFTY 100 Index' , description : 'Nifty 100 Index',downloadKey : 'nifty100list'});
db.watchlists.insert({_id: 'NIFTY200' , name : 'NIFTY 200 Index' , description : 'Nifty 200 Index',downloadKey : 'nifty200list'});
db.watchlists.insert({_id: 'NIFTYMidcapLiq15',name : 'NIFTY Midcap Liquid 15' , "description" : "NIFTY Midcap Liquid 15","downloadKey" : "Nifty_Midcap_Liquid15"});

db.watchlists.update({},{$set : {"active" : true, type:'index', subType:"NSE.IN"}},{multi:true});

*/

//  https://nseindia.com/content/indices/ind_Nifty_Midcap_Liquid15.csv

/* Transpose to Symbols
db.watchlists.aggregate([
    { $unwind: "$symbols" }
    ,{ $group: {
        '_id':"$symbols"

        ,"watchlists": {
            "$addToSet": "$_id"
                }
            }
        }
    ,{
        $project: {
            "_id":0
            , "_id" :"$_id._id"
            , symbol : "$_id.symbol"
            , name : "$_id.name"
            , industry : "$_id.industry"
            , market : "$_id.market"
            , watchlists:1
        }
    }]).pretty();

*/


/* Group the board meeting */
/*
db.boardmeetings.aggregate([
    {
        $group: {
            '_id': {
                symbol: '$symbol'
                , 'boardMeetingDate': '$boardMeetingDate'
                , 'purpose': '$purpose'

            }
        }
    }
    , {
        $group: {
            '_id': {
                symbol: '$_id.symbol'
                , 'boardMeetingDate': '$_id.boardMeetingDate'
            }
            , purposes: {
                '$addToSet': '$_id.purpose'

            }
        }
    }
    , {
        $group: {
            '_id': {
                symbol: '$_id.symbol'

            }
            , boardMeetings : {
                $addToSet: {
                    boardMeetingDate: '$_id.boardMeetingDate'
                    ,purposes : '$purposes'
                }
            }
        }
    }
    , {
        $project: {
            '_id': 0
            ,symbol: '$_id.symbol'
            , boardMeetings : '$boardMeetings'
        }
    }
]).pretty()
*/


/* Group the board meeting */
//Clear nextEarning field
/*
minimum board meeting date where pusrposes = "Results"
minimum board meeting date where pusrposes = "[^Results]"


*/


/*
db.boardmeetings.aggregate([
    {
        $group: {
            '_id': {
                symbol: '$symbol'
                , 'boardMeetingDate': '$boardMeetingDate'
                , 'purpose': '$purpose'

            }
        }
    }
    , {
        $group: {
            '_id': {
                symbol: '$_id.symbol'
                , 'boardMeetingDate': '$_id.boardMeetingDate'
            }
            , purposes: {
                '$addToSet': '$_id.purpose'

            }
        }
    }
    , {
        $group: {
            '_id': {
                boardMeetingDate : '$_id.boardMeetingDate'

            }
            , symbols : {
                $addToSet: {
                    symbol : '$_id.symbol'
                    ,purposes : '$purposes'
                }
            }
        }
    }
    , {
        $project: {
            '_id': 0
            ,Date: '$_id.boardMeetingDate'
            , symbols : '$symbols'
        }
    }
    , {
        $sort : { Date : 1 }
    }
]).pretty()
*/