'use strict';
// const angular = require('angular');

// /*@ngInject*/
// export function kiteService() {
// 	// AngularJS will instantiate a singleton by calling "new" on this function
// }

// export default angular.module('marketWatcherApp.kite', [])
//   .service('kite', kiteService)
//   .name;

angular.module('marketWatcherApp')
  .factory('kite', function () {
    var kite = {};
    return kite;
  });

