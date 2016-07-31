'use strict';

import mongoose from 'mongoose';

var WatchlistSchema = new mongoose.Schema({
  name: String,
  description: String,
  active: Boolean,
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
