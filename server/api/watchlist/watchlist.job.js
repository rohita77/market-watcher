//node dist/server/batchApp.job

'use strict';
import _ from 'lodash';
var indices = require('../../components/nsedata/indices');

//import Model and save to Mongo
import Watchlist from './watchlist.model';
//import controller from './watchlist.controller';

//TD: Refactor and move to "models" or "new api"
//import Model and save to Mongo
import Symbol from './symbol.model';

console.log("Watch List Job Fired Time is :" + new Date);
refreshWatchlists()
    .then(() => console.log("Finished Refreshing Watchlists"))
    .then(updateSymbolsFromWatchlists())
    .then(() => console.log("Finished Updating Symbols"))
    .then( () => Symbol.find({}).count().exec().then((c) => {
        console.log(`After Job DB has ${JSON.stringify(c)} symbols`);
    }))

function refreshWatchlists() {
    //Iterate through 'watchlists' and get symbols
    return new Promise((resolve, reject) => {

        Watchlist.find().exec()
            .then(refreshEachWatchlist())
            .then(() => resolve())
    });


}

function refreshEachWatchlist() {
    return (watchlists) => {

        //Return a Promise that is resolved when the promise for each watchlist is resolved
        return Promise.all(
            watchlists.map(watchlist => {

                //Promise for each watchlist that is resolved when the symbols are tretrieved and saved
                return new Promise((resolve, reject) => {

                    indices.getSymbolsInWatchList(watchlist)
                        //save the symbols in the watchlist once they are downloaded
                        .then(symbols => {
                            console.log(`Fetched Watchlist ${watchlist.name} / ${watchlist.downloadKey} with ${symbols.length} symbols`);
                            watchlist.symbols = symbols;
                            return watchlist.save();
                        })
                        //resolve the promise for the watchlist once its saved
                        .then((e, r) => {
                            console.log(`Saved Watchlist ${watchlist.name} / ${watchlist.downloadKey} with ${e.symbols.length} symbols `);
                            resolve();
                        });
                })
                    ;
            }));

    }



}

//Create/Update symbols and their associate watchlist in DB using unique list of symbols from all watchlists
function updateSymbolsFromWatchlists() {
    console.log("Firing Symbol saves");

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

    return new Promise((resolve, reject) => {

        Watchlist.aggregate(pipleline)
            //    .limit(2)
            .exec()
            .then(updateEachSymbolFromWatchlists())
            .then(() => resolve())

    })

}


function updateEachSymbolFromWatchlists() {
    return (symbols) => {
        return Promise.all(
            //Save list of symbols
            symbols.map(symbol => {
                return new Promise((resolve, reject) => {
                    Symbol.findById(symbol._id)
                        .exec()
                        //If symbol does not exist in DB, create Symbol Model from symbol in watchlist
                        .then( rSymbol => rSymbol ? rSymbol : new Symbol(symbol))
                        //Update new/existing symbol model using symbol from watchlist
                        .then(mSymbol => {
                            return _.merge(mSymbol, symbol)
                                .save((e, r) => e ? console.log(`error: ${JSON.stringify(e)}`) : null
                                )
                        })
                        .then(() => resolve())
                })
            })
        )
    }
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