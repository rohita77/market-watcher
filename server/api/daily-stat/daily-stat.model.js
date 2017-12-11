'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './daily-stat.events';

var DailyStatSchema = new mongoose.Schema({
  _id : String,
  quotestats : {}
});

registerEvents(DailyStatSchema);
export default mongoose.model('DailyStat', DailyStatSchema);
