'use strict'

import moment from 'moment';

// Set default node environment to development
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'production';

if (env === 'development' || env === 'test') {
    // Register the Babel require hook
    require('babel-register');
}


import mongoose from 'mongoose';


mongoose.plugin(require('./components/lastMod'));

mongoose.Promise = require('bluebird');
var config = require('./config/environment');

let [a, b, db, targetModelName, ...params] = process.argv;

let uri = `mongodb://localhost/${db}`
// Connect to MongoDB
mongoose.connect(uri, config.mongo.options);
mongoose.connection.on('error', function (err) {
    console.error('MongoDB connection error: ' + err);
    process.exit(-1);
});

const models = [
    {
        modelName: 'fno-mkt-lot',
        modelPath: './components/nse-data-adapter/models/fno-mkt-lot.model',
    },
    {
        modelName: 'quote',
        modelPath: './api/quote/quote.model',
    },
    {
        modelName: 'option-chain',
        modelPath: './api/option-chain/option-chain.model',
    },
]


targetModelName = new RegExp('^' + targetModelName + '$');

let targetModel = models.find(
    m => m.modelName.match(targetModelName)
);

console.log(`ModelPath: ${targetModel.modelPath}`);

let model = require(targetModel.modelPath);

//Test from getting mktlot
// model.default.getFnOMktLot(params[2], params[1])
//     .then(
//         (r) =>
//             console.log(`Market lot for ${params[2]} / ${params[1]}  is ${JSON.stringify(r)}`)
//     )
//     .then(() => process.exit(0));



model.default.test(params)
.then(() => process.exit(0));


/* node dist/server/model.test mlab-24-Feb-18 quote getDailyQuoteStats 20180221 */
/* node dist/server/model.test marketwatcher option-chain getOptionChainSubsetForSymbol HINDALCO 230 */

/*
https://nse-india.com/products/dynaContent/common/productsSymbolMapping.jsp?instrumentType=OPTIDX&symbol=NIFTY&expiryDate=28-12-2017&optionType=CE&strikePrice=&dateRange=&fromDate=01-Oct-2017&toDate=28-Dec-2017&segmentLink=9&symbolCount=
ss
dddd
*/