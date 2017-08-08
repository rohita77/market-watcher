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


/* Next Earning Date */
var tgtEarningDate = new Date();

query.boardMeetingDate = {$lte : tgtEarningDate};
query.purpose = /^Results/;
sort.boardMeetingDate = -1;
sort.purpose = 1;

query.symbol = /^YESBANK/;

var  arrRes= db.boardmeetings.find(query).sort(sort).limit(1);
print(JSON.stringify(arrRes.toArray()));
