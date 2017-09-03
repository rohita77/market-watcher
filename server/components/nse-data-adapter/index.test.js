'use strict'

var optionChainTools = require('../../../components/nse-data-adapter/index');


optionChainTools.getStockOptionChain('RELIANCE', '31AUG2017')
    .then((optionChainData) => console.log(optionChainData))



