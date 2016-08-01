'use strict';

(function () {

  class SymbolsGridComponent {
    constructor($log, $interval, $resource) {
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

      //GetSymbols
      var watchlistData = this.$resource('/api/watchlists/Nifty50');
      watchlistData.get().$promise
        .then((data) => {
          this.watchlist = data;
          console.log('watchlist: ' + data.name + ' has ' + data.symbols.length + ' symbols');

          this.watchlist.symbols.forEach(symbol => {
            /*
              symbol.key = {};
              symbol.key.symbol = symbol.symbol;
              symbol.key.name = symbol.name;
            */
            symbol.key = symbol.symbol + ':' + symbol.name;
            console.log(symbol);
            //no match?
          });

          this.refreshQuoteData();

          //      let refreshQuoteDataPromise = this.$interval (this.refreshQuoteData, 1000);

          let refreshQuoteDataPromise = this.$interval(this.refreshQuoteData.bind(this), 5 * 60 * 1000);


        }) //based on format
        .catch((data, status, headers, config) => {
          this.$log.warn(data, status, headers, config);
        });


    }

    toggleSelectedSymbol(symbol) {
      this.selectedSymbol = symbol;
    }


    $onInit() {
      this.filterIsCollapsed = true;
    }

    refreshQuoteData() {
      //not working
      let quoteData = this.$resource('/api/quotes'); //niftyStockWatch

      //TD: Refreshing only Data and not Symbols?
      quoteData.get().$promise
        .then((data) => {
          //      this.quotes = data;
          this.quoteTime = data.time;
          this.refreshTime = data.refreshtime;
          console.log('first call - number of quotes: ' + data.length);

          //       if (this.watchlist == undefined)  {
          //         this.watchlist = this.watchlistInit;
          //       }

          this.watchlist.symbols.forEach(symbol => {
            symbol.quote = data.data.find(quote => {
              return quote.symbol.match(
                new RegExp('^' + symbol.symbol + '$'));
            });
            //no match?
          });

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