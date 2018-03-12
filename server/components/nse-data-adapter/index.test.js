'use strict'

// var nseTools = require('../../../components/nse-data-adapter/index');


// nseTools.getStockOptionChain('RELIANCE', '31AUG2017')
//     .then((optionChainData) => console.log(optionChainData))

var NSEDataAdapter = require( './index')

NSEDataAdapter.getFnOLotSizes()
    .then((bmArr) => {
        // log(`Retrieved ${bmArr.length} lot sizes`)
        console.log(bmArr);

    })
    .then((docs, e) => {
        // log(`Inserted ${docs.length} lot sizes ${e} errors`);
    })