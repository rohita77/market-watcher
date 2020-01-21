/* Calendar */
/*
var tgtEarningDate = new Date();
tgtEarningDate.setDate(tgtEarningDate.getDate() + 1);
var  arrRes= db.boardmeetings.find({boardMeetingDate : {$lte : tgtEarningDate}}).toArray();
print(JSON.stringify(arrRes));
*/
var query = {};
var sort = {};
var limit = {};

let print = console.log;

/* Next Earning Date */
var tgtEarningDate;
 tgtEarningDate = ((new Date()));

print(JSON.stringify(tgtEarningDate));
//tgtEarningDate.setDate(tgtEarningDate.getDate() - 1);
print(JSON.stringify(new Date(tgtEarningDate.toLocaleDateString())));

//query.boardMeetingDate = {$lte : tgtEarningDate};
query.boardMeetingDate = {$lte : tgtEarningDate};
query.purpose = /^Results/;
sort.boardMeetingDate = -1;
sort.purpose = 1;

query.symbol = /^HINDALCO/;

let db
var  arrRes= db.boardmeetings.find(query).sort(sort).limit(1);
print(JSON.stringify(arrRes.toArray()));
