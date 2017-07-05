'use strict';

import mongoose from 'mongoose';

var WatchlistSchema = new mongoose.Schema({
  _id : String,
  name: String, //NIFTY 50 Index
  description: String,
  active: Boolean,
  type: String,   //index
  subType: String, //NSE.IN
  downloadKey: String,
  symbols: [ {
        market : String,
        symbol : String,
        name  : String,
        industry : String,
        id  : String
  }
  ]
});

export default mongoose.model('Watchlist', WatchlistSchema);
