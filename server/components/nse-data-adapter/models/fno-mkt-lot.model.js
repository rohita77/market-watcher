'use strict';

import mongoose from 'mongoose';
import moment from 'moment';

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

export default mongoose.model('FNOMktLot', FnOMktLotSchema);