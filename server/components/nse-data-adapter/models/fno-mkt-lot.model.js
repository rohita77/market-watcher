'use strict';

const mongoose = require('mongoose');
const moment = require('moment');

var FnOMktLotSchema = new mongoose.Schema({
  symbol: String,
  mktlot: {}
});

FnOMktLotSchema.statics.getFnOMktLot = function (symbol, expiryMonth) {

  let query = {
    symbol: symbol
  };

  return this.findOne(query).exec()
    .then(r => r ? r.mktlot[expiryMonth.toUpperCase()] : null);
}

module.exports = mongoose.model('FNOMktLot', FnOMktLotSchema);