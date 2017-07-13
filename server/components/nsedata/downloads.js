'use strict';

//import NSEDataAdapter from './index';
var NSEDataAdapter = require( './index'); //TD:

export function getSymbolsInWatchList(watchlist) {

  return NSEDataAdapter.getSymbolsInIndex(watchlist.downloadKey);

}

export function getFCBoardMeetings() {

  return NSEDataAdapter.getBoardMeetings('All_Forthcoming');

}