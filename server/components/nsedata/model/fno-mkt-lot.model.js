'use strict';

import mongoose from 'mongoose';

var FNOMktLotSchema = new mongoose.Schema({
  symbol: String,
  mktlot : {}
});

export default mongoose.model('FNOMktLot', FNOMktLotSchema);