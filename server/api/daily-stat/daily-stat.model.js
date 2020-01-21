'use strict';

const mongoose = require('mongoose');
const registerEvents = require('./daily-stat.events').registerEvents;
var DailyStatSchema = new mongoose.Schema({
  _id : String,
  quotestats : {}
});

registerEvents(DailyStatSchema);
module.exports = mongoose.model('DailyStat', DailyStatSchema);
