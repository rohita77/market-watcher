'use strict';

function moveSizeFilter() {
  return function (input, thresholds) {

  if (isNaN(+input) ) {
      throw new Error('Input should be a numeric value');
    }

    if (!thresholds.every((elem)=>{return  !isNaN(elem); })) {
      throw new Error('Threshold should be an array of numeric values');
    }

    let move = Number(input);
    let sz = ((move >= 0) ? 'u' : 'd') + '-';
    let i = 0;


    let sortedThresholds = thresholds.sort((a,b)=>a-b);

    move = Math.abs(move);

    for (i = 0; i < sortedThresholds.length; i++) {

      if (move <= sortedThresholds[i]) {
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
