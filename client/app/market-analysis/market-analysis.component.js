'use strict';
// const angular = require('angular');

// const uiRouter = require('angular-ui-router');

// import routes from './market-analysis.routes';

(function () {

  class MarketAnalysisComponent {
    /*@ngInject*/
    constructor($log, $resource) {
      this.$resource = $resource;
      let dailyStatRes = this.$resource('/api/daily-stats');

      dailyStatRes.get().$promise
              .then((data) => {
                this.dailyStat = data.data;
              });

    }
  }


  angular.module('marketWatcherApp.market-analysis', ['ui.router'])
  // .config(routes)
  .component('marketAnalysis', {
    templateUrl: 'app/market-analysis/market-analysis.html',
    controller: MarketAnalysisComponent,
    controllerAs: 'marketAnalysisCtrl'
  })
  .name;

})();


