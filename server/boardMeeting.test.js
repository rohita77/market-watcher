'use strict';

var NSEDataAdapter = require( './components/nse-data-adapter/index'); //TD:


let moment = require('moment');

/* Earnings
    let tgtBoardMeetingDate = new Date();
    tgtBoardMeetingDate.setDate(tgtBoardMeetingDate.getDate() - 1); //TD: Timezone //TD:Trim Date?
    console.log(`Tgt Board Meeting Date ${tgtBoardMeetingDate}`);

    console.log(new Date(moment()));

    let quarterFromPreviousEarnings = moment(tgtBoardMeetingDate).clone().add(1, 'quarters')
    console.log(quarterFromPreviousEarnings.toDate().toLocaleDateString());
    console.log(`quarterFromPreviousEarnings ${quarterFromPreviousEarnings.diff(moment(),'days')}`);

*/
/*
let obj1 = {
    SYMBOL : "BHEL",
    'APR-16',
    'MAY-16': 2000,
    'JUN-16': 2000,
    'SEP-16':2000,
    'DEC-16':2000,
    'MAR-17':2000,
    'JUN-17':2000
};
console.log(`onj1 ${JSON.stringify(obj1)}`);
let symbol,rest

({symbol, rest} = {obj1});

console.log(`obj1 ${rest}`);
*/

//let a = moment().utcOffset('+05:30');
let getExpiryDate = NSEDataAdapter.getExpiryDate;

let d = 27;

[
'JAN-2017',
'FEB-2017',
'MAR-2017',
'APR-2017',
'MAY-2017',
'JUN-2017',
'JUL-2017',
'AUG-2017',
'SEP-2017',
'OCT-2017',
'NOV-2017',
'DEC-2017'].forEach(exprMonth => {

    let bom = moment(exprMonth,"MMM-YYYY").startOf('month');
    let sampleDate = bom.clone().utcOffset("+05:30").add(d,"days");
    console.log(`For trading month ${exprMonth} expiry date is ${getExpiryDate(bom).format("DD-MMM ")}`);
    console.log(`Trading month is ${NSEDataAdapter.getExpiryMonth(sampleDate)} for trading date ${sampleDate.format("DD-MMM")} and expiry date is ${getExpiryDate(sampleDate).format("DD-MMM")}`);

    let nextTradingDate = NSEDataAdapter.getNextTradingDate(sampleDate);
    console.log(`Next Trading date is ${nextTradingDate.format("DD-MMM")} for trading date ${sampleDate.format("DD-MMM")} and next expiry date is ${getExpiryDate(nextTradingDate).format("DD-MMM")}`);

})
