'use strict';

var indices = require('../../components/nsedata/indices');

//import Model and save to Mongo
import Watchlist from './watchlist.model';
//import controller from './watchlist.controller';

console.log("Job Fired Time is :" + new Date);

Watchlist.find().exec()
    .then((watchlists) => {
        watchlists.forEach(watchlist => {

            indices.getSymbolsInWatchList(watchlist)
                .then((symbols) => {
                    console.log('Watchlist ' + watchlist.name + '/' + watchlist.downloadKey + ' fetched ' + symbols.length + ' symbols');

                    watchlist.symbols = symbols;
                    watchlist.save();

                });
            //Handle not found
            return;

        });

    });

// db.watchlists.update({},{$set : {"active" : true, type:'index', subType:"NSE.IN"}},{multi:true});

/*
db.watchlists.insert({_id: 'NIFTY50' , name : 'NIFTY 50 Index' , description : 'Nifty 50 Index',downloadKey : 'nifty50list'});
db.watchlists.insert({_id: 'NIFTY100' , name : 'NIFTY 100 Index' , description : 'Nifty 100 Index',downloadKey : 'nifty100list'});
db.watchlists.insert({_id: 'NIFTY200' , name : 'NIFTY 200 Index' , description : 'Nifty 200 Index',downloadKey : 'nifty200list'});
db.watchlists.insert({_id: 'NIFTYMidcapLiq15',name : 'NIFTY Midcap Liquid 15' , "description" : "NIFTY Midcap Liquid 15","downloadKey" : "Nifty_Midcap_Liquid15"});
*/
//  https://nseindia.com/content/indices/ind_Nifty_Midcap_Liquid15.csv