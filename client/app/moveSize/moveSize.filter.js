'use strict';

function moveSizeFilter() {
  return function (input, thresholds) {
    let move = Number(input);
    let sz = ((move >= 0) ? 'u' : 'd') + '-';
    let i = 0;

    for (i = 0; i < thresholds.length; i++) {

      if (Math.abs(move) <= thresholds[i]) {
        return sz += 'x';
      }
      else {
        sz += 'x';
      }
    }
    return sz;

  };
}


angular.module('marketWatcherApp')
  .filter('moveSize', moveSizeFilter);
