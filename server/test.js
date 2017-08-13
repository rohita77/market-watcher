'use strict';

    let moment= require('moment');

    let tgtBoardMeetingDate = new Date();
    tgtBoardMeetingDate.setDate(tgtBoardMeetingDate.getDate() - 1); //TD: Timezone //TD:Trim Date?

    console.log(tgtBoardMeetingDate);

     console.log(new Date(moment()));


    let quarterFromPreviousEarnings = moment(tgtBoardMeetingDate).clone().add(1, 'quarters')

    console.log(quarterFromPreviousEarnings.toDate().toLocaleDateString());

    console.log(quarterFromPreviousEarnings.diff(moment(),'days'));
