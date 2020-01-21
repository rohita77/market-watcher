'use strict';

const mongoose = require('mongoose');
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
        _id  : String
  }
  ]
});

module.exports = mongoose.model('Watchlist', WatchlistSchema);
