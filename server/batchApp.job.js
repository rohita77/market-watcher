'use strict';

// Set default node environment to development
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'production';

if (env === 'development' || env === 'test') {
  // Register the Babel require hook
  require('babel-register');
}

// Export the application
//exports = module.exports = require('./app');

import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
 var config = require('./config/environment');

// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});


// Setup server
//var app = express();
//require('./routes').default(app);

// Expose app
//exports = module.exports = app;

//TD: Can user Router?
//Maintain List of Jobs: Name, Last Refresh Time, Status, Frequency
// api/jobs --> Show only Admin
// Time between 5-6 pm IST or not refreshed in the last 24 hours
// Refresh: not successful/empty or not modified

//Refresh Watch List
require('./api/watchlist/watchlist.job');
// process.exit(0);
//Update Symbols with new watchlist