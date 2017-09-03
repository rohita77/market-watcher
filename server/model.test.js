'use strict'

//var optionChainTools = require('./components/nse-data-adapter/index');

import moment from 'moment';

// Set default node environment to development
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'production';

if (env === 'development' || env === 'test') {
    // Register the Babel require hook
    require('babel-register');
}


import mongoose from 'mongoose';
import FnOMktLot from './components/nse-data-adapter/models/fno-mkt-lot.model';

mongoose.plugin(require('./components/lastMod'));

mongoose.Promise = require('bluebird');
var config = require('./config/environment');

// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function (err) {
    console.error('MongoDB connection error: ' + err);
    process.exit(-1);
});

let expiryMonth = moment('28-SEP-2017',"DD-MMM-YYYY").format("MMM-YY").toUpperCase();

//Test from getting mktlot
FnOMktLot.getFnOMktLot('HINDALCO', expiryMonth)
    .then(
    (r) =>
        console.log(`Market lot is ${JSON.stringify(r)}`)
    )


/*optionChainTools.getStockOptionChain('RELIANCE', '31AUG2017')
    .then((optionChainData) => console.log(optionChainData))

*/

