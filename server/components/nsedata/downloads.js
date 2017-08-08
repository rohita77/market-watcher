'use strict';

//import NSEDataAdapter from './index';
var NSEDataAdapter = require( './index'); //TD:

export function getSymbolsInWatchList(watchlist) {

  return NSEDataAdapter.getSymbolsInIndex(watchlist.downloadKey);

}

export function getFCBoardMeetings() {

  return NSEDataAdapter.getBoardMeetings('All_Forthcoming');

}

export function getBoardMeetingsForLast3Months() {

  return NSEDataAdapter.getBoardMeetings('Last_12_Months'); //To deal with boundary value past earningg

}