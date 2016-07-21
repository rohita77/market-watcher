'use strict';

(function () {

  class SymbolsGridComponent {
    constructor($log, $interval, $resource) {
      this.message = 'Hello';
      this.$resource = $resource;
      this.$interval = $interval;
      this.$log = $log;
      this.filterIsCollapsed = true;


      this.betaFilterOptions = [
        { 'value': undefined, 'label': 'All' },
        { 'value': 0.5, 'label': 'less than 0.5' },
        { 'value': 1, 'label': 'between 0.5 and 1.5' },
        { 'value': 1.5, 'label': 'greater than 1.5' },
      ];

      this.sortorder = 'symbol';
      this.refreshQuoteData();

      //      let refreshQuoteDataPromise = this.$interval (this.refreshQuoteData, 1000);

      let refreshQuoteDataPromise = this.$interval(() => {
        let quoteData = this.$resource('/api/quotes/niftyStockWatch');

        /*cross domain error
        let quoteData = self.$resource('https://www.nseindia.com/live_market/dynaContent/live_watch/stock_watch/niftyStockWatch.json');
        */

        //TD: Refreshing only Data and not Symbols?
        quoteData.get().$promise
          .then((data) => {
            this.quotes = data;
            console.log('number of quotes:  ' + this.quotes.data.length);
          }) //based on format
          .catch((data, status, headers, config) => {
            this.$log.warn(data, status, headers, config);
          });

      }, 5 * 60 * 1000);


    }

    toggleSelectedSymbol(quote) {
      this.selectedSymbolName = quote.symbol;
    }


    $onInit() {
      this.filterIsCollapsed = true;
    }

    refreshQuoteData() {
      //not working
      let quoteData = this.$resource('/api/quotes/niftyStockWatch');

      //TD: Refreshing only Data and not Symbols?
      quoteData.get().$promise
        .then((data) => {
          this.quotes = data;
          console.log('first call - number of quotes: ' + this.quotes.data.length);
        }) //based on format
        .catch((data, status, headers, config) => {
          this.$log.warn(data, status, headers, config);
        });

    }

  }

  angular.module('marketWatcherApp')
    .component('symbolsGrid', {
      templateUrl: 'app/symbolsGrid/symbolsGrid.html',
      controller: SymbolsGridComponent,
      controllerAs: 'symbolsGridCtrl'
    });

})();
