//node dist/server/batchApp.job

'use strict';
import _ from 'lodash';
//import downloads from '../../components/nsedata/downloads'; //TD:
var downloads = require('../../components/nsedata/downloads');

//import Model and save to Mongo
import Watchlist from './watchlist.model';
//import controller from './watchlist.controller';

//TD: Refactor and move to "models" or "new api"
//import Model and save to Mongo
import Symbol from './../symbol/symbol.model';


//TD: Refactor and move to "models" or "new api"
//import Model and save to Mongo
import boardMeeting from '../../api/board-meeting/board-meeting.model';

export function run() {
    console.log("Watch List Job Fired Time is :" + new Date);
    return refreshWatchlists()
        .then(() => console.log("Finished Refreshing Watchlists: " + new Date))
        .then(() => refreshBoardMeetings())
        .then(() => console.log("Finished Refreshing Board Meetings for symbols " + new Date))
        .then(() => updateSymbolsFromWatchlists())
        .then(() => console.log("Finished Updating Symbols for Watchlists: " + new Date))
        .then(() => Symbol.find({}).count().exec().then((c) => {
            console.log(`After Job DB has ${JSON.stringify(c)} symbols`);
        }))
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

            //Promise for each watchlist that is resolved when the symbols are tretrieved and saved
            return downloads.getSymbolsInWatchList(watchlist)
                //save the symbols in the watchlist once they are downloaded
                .then(symbols => {
                    console.log(`Fetched Watchlist ${watchlist.name} / ${watchlist.downloadKey} with ${symbols.length} symbols`);
                    watchlist.symbols = symbols;
                    return watchlist.save();
                })
                //resolve the promise for the watchlist once its saved
                .then((e, r) => {
                    console.log(`Saved Watchlist ${watchlist.name} / ${watchlist.downloadKey} with ${e.symbols.length} symbols `);
                });

        }));

}

//Create/Update symbols and their associate watchlist in DB using unique list of symbols from all watchlists
function updateSymbolsFromWatchlists() {
    //Transpose to get unique list of symbols and associated watchlists
    let pipleline = [
        { $unwind: "$symbols" }
        , {
            $group: {
                '_id': "$symbols"

                , "watchlists": {
                    "$addToSet": "$_id"
                }
            }
        }
        , {
            $project: {
                "_id": 0
                , "_id": "$_id._id"
                , symbol: "$_id.symbol"
                , name: "$_id.name"
                , industry: "$_id.industry"
                , market: "$_id.market"
                , watchlists: 1
            }
        }];

    console.log("Firing Symbol saves at " + new Date);
    return Watchlist.aggregate(pipleline)
        //    .limit(2)
        .exec()
        .then(symbols => updateEachSymbolFromWatchlists(symbols))

}

function updateEachSymbolFromWatchlists(symbols) {
    return Promise.all(
        //Save list of symbols
        symbols.map(symbolDoc => {
            return Promise.all([

                //Move to Board Meetings
                //Tag Board Meetings with Watchlists

                updateBoardMeetingsWithWatchlist(symbolDoc), //Group Promises
                updateSymbol(symbolDoc)
            ])
        })
    )
}

function populateNextEarnings(symbolDoc) {
    /* Next Earning Date */

    let query = {};
    let sort = {};


    let tgtEarningDate = new Date();
    tgtEarningDate.setDate(tgtEarningDate.getDate() - 1); //TD: Timezone

    query.boardMeetingDate = { $gte: tgtEarningDate };
    query.purpose = /^Results/;
    sort.boardMeetingDate = 1;
    sort.purpose = 1;

    query.symbol = symbolDoc.symbol;

    return boardMeeting.find(query).sort(sort).limit(1).exec()
        .then(bM => {
            symbolDoc.nextEarnings = bM[0] ? bM[0].boardMeetingDate : null;
            return symbolDoc;
        });
}

function updateSymbol(symbolDoc) {

    return Symbol.findById(symbolDoc._id)
        .exec()
        //If symbol does not exist in DB, create Symbol Model from symbol in watchlist
        .then(rSymbol => rSymbol ? rSymbol : new Symbol(symbolDoc))
        //Update next Earnings Date
        .then(eSymbol => populateNextEarnings(eSymbol))
        //Update new/existing symbol model using symbol from watchlist
        .then(mSymbol => {
            return _.merge(mSymbol, symbolDoc)
                .save((e, r) => e ? console.log(`error: ${JSON.stringify(e)}`) : null
                )
        })


}

function updateBoardMeetingsWithWatchlist(symbolDoc) {
    return boardMeeting.updateMany(
        { 'symbol': symbolDoc.symbol },
        { 'watchlists': symbolDoc.watchlists },
    ).exec()

}
//TD:
function refreshBoardMeetings() {
    return boardMeeting.remove({}).exec() //TD: Remove only Future
        .then(() => downloads.getFCBoardMeetings())
        .then((bmArr) => {
            console.log(`Retrieved ${bmArr.length} forthcoming meetings`)
            console.log(`Inserting forthcoming meetings`);
            return boardMeeting.insertMany(bmArr);
        })
        .then((docs, e) => {
            console.log(`Board meeting insert errors: ${e}`);
            console.log(`Board meetings inserted: ${docs.length}`);

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
            return (fCV.symbol === rCV.symbol) && (fCV.boardMeetingDate === rCV.boardMeetingDate);

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

    }

        , []);
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