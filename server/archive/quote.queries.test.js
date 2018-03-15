{

    load("server/api/quote/quote.queries.js");
    let rnd = (n) => Math.round(n * 10) / 10;

    //Test 1
    // let pipeline = getPipelineForDailvAverageQuotes(['INFY', "M&M", 'RELIANCE'], "20171208");
    let pipeline = getPipelineForDailvAverageQuotes([], "20180220");
    // let pipeline = getPipelineForDailvAverageQuotes([]);


    print('***********************************************Pipeline***********************************************************************************');
    print(`${JSON.stringify(pipeline)}  `);


    print('*****************************************************************************************************************************************************');
    var arrRes = db.quotes.aggregate(pipeline, { allowDiskUse: true });

    print(`Date         UL#    Vol         T/O      ROC     ExpHi%     ExpLo%  CallBA  PutBA   CallIV  PutIV    CallOI      PutOI`);

    arrRes.toArray().forEach((e) => {
        print(`${e._id}     ${e.totalSymbols}      ${rnd(e.avgVol)}     ${rnd(e.avgTurnover)}       ${rnd(e.avgMaxROC)}     ${rnd(e.avgExpHiPer)}       ${rnd(e.avgExpLowPer)}      ${rnd(e.avgCallBA)}     ${rnd(e.avgPutBA)}      ${rnd(e.avgCallIV)}  ${rnd(e.avgPutIV)}     ${rnd(e.avgCallOI)}    ${rnd(e.avgPutOI)}`);
    })


}

//load("server/api/quote/quote.queries.test.js");