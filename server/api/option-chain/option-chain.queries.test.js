/* Calendar */
// cd("/Users/rohit/Documents/GitHub")
//load("market-watcher/server/api/option-chain/option-chain.queries.test.js")



{

load("market-watcher/server/api/option-chain/option-chain.queries.js")

let pipeline = getPiplelineForOCSubset('HINDALCO',244);

print('***********************************************Pipeline***********************************************************************************');
print(`${JSON.stringify(pipeline)}  `);


print('*****************************************************************************************************************************************************');
var arrRes = db.optionchains.aggregate(pipeline);

arrRes.toArray().forEach((u) => {
    let o = {};
    print(`${JSON.stringify(u.symbol)} Exp High: ${JSON.stringify(u.expectedHigh)} Exp Low: ${JSON.stringify(u.expectedLow)}  Exp High%: ${JSON.stringify(u.percentExpectedHigh)} Exp Low%: ${JSON.stringify(u.percentExpectedLow)}`);
    print('>>>>>>>>>>>>');
    print(`ATM: ${JSON.stringify(u.ATMOption)}`);
    print(`NTM: ${JSON.stringify(u.NTMOption)}`);

    print('------------------------------------------------ Expected High Call -----------------------------------------------------------------------------------------------');
    o = u.firstStrikeAboveExpectedHigh;
    [o.call._id, o.call.breakEven, o.call.askQty, o.call.askPrice, o.call.bidPrice, o.call.bidQty, o.call.ltp] = [];
    print(`Call BE: ${o.strikePrice} Option: ${JSON.stringify(o.call)}`);

    print('------------------------------------------------ Expected Low Put --------------------------------------------------------------------------------------------------');
    o = u.firstStrikeBelowExpectedLow;
    [o.put._id, o.put.breakEven, o.put.askQty, o.put.askPrice, o.put.bidPrice, o.put.bidQty, o.put.ltp] = [];
    print(`Put BE: ${o.strikePrice} Option: ${JSON.stringify(o.put)}`);

    print('------------------------------------------------ CALLS -----------------------------------------------------------------------------------------------');

    u.strikesAboveExpectedHigh.forEach((s) => {
        [s.call._id, s.call.breakEven, s.call.askQty, s.call.askPrice, s.call.bidPrice, s.call.bidQty, s.call.ltp] = [];
        print(`${s.strikePrice}, C:${JSON.stringify(s.call)}  `);
    })
    print('------------------------------------------------ PUTS -----------------------------------------------------------------------------------------------');

    u.strikesBelowExpectedLow.forEach((s) => {
        [s.put._id, s.put.breakEven, s.put.askQty, s.put.askPrice, s.put.bidPrice, s.put.bidQty, s.put.ltp] = [];
        print(`${s.strikePrice}, P:${JSON.stringify(s.put)}  `);
    })

})


}

/*Call: {"percentSpread":71.43,"midPrice":0.22,
"breakEven":1300.22,"netChng":-0.3,"ltp":0.1,"iv":90.71,"volume":2,"chngInOI":-500,"oi":44000}*/

//=ROUNDUP(SUM('NifttLotSize-Temp'[LotSize])*sum(ICICIMargin[Initial Margin %])*sum([LTP])/100;0)