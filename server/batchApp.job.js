'use strict';

let moment = require('moment');

// Set default node environment to development
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'production';

if (env === 'development' || env === 'test') {
  // Register the Babel require hook
  require('@babel/register');
}

// Export the application
//exports = module.exports = require('./app');

let mongoose =require('mongoose');
mongoose.plugin(require('./components/lastMod'));

mongoose.Promise = require('bluebird');
var config = require('./config/environment');


mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

config.mongo.uri = "mongodb://heroku_1mcgzhnk:25cb69cn9o7ppkbmsu5q1gvho3@ds027628.mlab.com:27628/heroku_1mcgzhnk"

// Connect to MongoDB
console.log(`Connect to Mongo DB at ${config.mongo.uri.substring(0,30)}`)
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function (err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});

//Move to Config
const jobSchedules = [
  {
    jobName: 'refreshWatchlist',
    jobModule: './api/watchlist/watchlist.job',
    jobStartHour: 17,
    jobEndHour: 20
  },
  {
    //https://www1.nseindia.com/products/content/derivatives/equities/mrkt_timing_holidays.htm
    jobName: 'refreshQuotesForFnOStocks',
    jobModule: './api/quote/quote.job',
    jobStartHour: 9,                    //9.15
    jobEndHour: 16                      //15.30, 16.15(excercise)
  }
]

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

let targetJobName = process.argv[2] || 'refreshWatchlist';
let runSchedule = process.argv[3] || 'regular';

targetJobName = new RegExp('^' + targetJobName + '$');

let jobSchedule = jobSchedules.find(
  js => js.jobName.match(targetJobName)
);

var job = require(jobSchedule.jobModule);


let jobRunHour = moment().utcOffset("+05:30").subtract(11, 'minutes').hour();
let jobRunWeekDay = moment().utcOffset("+05:30").isoWeekday();

let runNotInRegularJobSchedule = (!((jobRunHour >= jobSchedule.jobStartHour) && (jobRunHour <= jobSchedule.jobEndHour) &&(jobRunWeekDay <= 5)));

if (runNotInRegularJobSchedule && (runSchedule === 'regular')) {
  console.log(`Exiting as Job ${jobSchedule.jobName} run is outside market hours:(${jobRunHour}) or weekdays:(${jobRunWeekDay}))`);
  process.exit(0)
}
else
    console.log(`Initiating Job ${jobSchedule.jobName} at hour:(${jobRunHour}) and weekday:(${jobRunWeekDay})) as per ${runSchedule} schedule`);


job.run()
.then(() => process.exit(0));

