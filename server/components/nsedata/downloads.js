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

  return NSEDataAdapter.getBoardMeetings('Last_3_Months'); //12 Months? To deal with boundary value past earningg

}

export function getFnOLotSizes() {

  return NSEDataAdapter.getFnOLotSizes(); //No Download Key

}

