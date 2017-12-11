'use strict';

angular.module('marketWatcherApp.market-analysis')
.config(function($stateProvider) {
  $stateProvider
    .state('market-analysis', {
      url: '/market-analysis',
      views: {
        '' : {
          template: '<market-analysis></market-analysis>'
        }
      }
    });
});


