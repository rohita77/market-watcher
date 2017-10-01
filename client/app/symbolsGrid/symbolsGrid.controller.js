'use strict';

(function () {


  class SymbolsGridComponent {
    constructor($log, $interval, $resource, $sce) {
      this.$resource = $resource;
      this.$interval = $interval;
      this.$log = $log;
      this.filterIsCollapsed = true;
      this.sortBy = 'symbol';
      this.sortReverse = false;
      this.incEarnings = false;

      //GetSymbols
      //let watchlistData = this.$resource('/api/watchlists/NIFTY100');
      //TD: Select from Drop Down
      let symbolsData = this.$resource('/api/symbols/?watchlists=NIFTY100');

      symbolsData.get().$promise
        .then((data) => {
          this.watchlist = {
            name: 'NIFTY100', //TD: move to server
            symbols: data.data
          };

          this.$log.info(`Retrieved watchlist ${this.watchlist.name} with ${this.watchlist.symbols.length} symbols`);

          this.watchlist.symbols.forEach(symbol => {

            symbol.key = [symbol.symbol, symbol.name, symbol.industry];

            //TD: To fix sorting issue when quotes are missing, no match?
          });

          //TD: Emit from Server instead of client refresh
          this.refreshQuoteData(true);

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

    refreshQuoteData(isFirstCall) {

      let quoteData = this.$resource('/api/quotes'); //TD: Pass Select Watchlist name

      //TD: Refreshing only Data and not Symbols?
      quoteData.get().$promise
        .then((data) => {

          this.quoteTime = data.quoteTime;
          this.refreshTime = data.refreshTime;

          if (isFirstCall) {
            this.sortBy = 'quote.per';
            this.sortReverse = false;

            this.$log.info(`First Call retrieved ${data.quotes.length} quotes`);
          }

          this.watchlist.symbols.forEach(symbol => {
              symbol.quote = data.quotes.find(quote => {
                return quote.symbol.match(
                  new RegExp('^' + symbol.symbol + '$'));
              });
              //no match?
              if (symbol.quote === undefined) symbol.quote = { };

            });

        }) //based on format
        .catch((data, status, headers, config) => {
          this.$log.warn(data, status, headers, config);
        });


      this.getSortOrder = (symbol) => {

        if (this.sortBy.match('^quote.')) {

          //convert string in dotNotation to object reference
          let sortOrder = this.sortBy.split('.').reduce((o, i) => o[i], symbol);

          return -1.0 * Math.abs(sortOrder);
        }
        else {
          return symbol[this.sortBy];
        }
        //  return -1.0 * Math.abs(symbol.quote['per']);
      };

      this.setSortBy = (sortBy) => {
        this.sortReverse = (this.sortBy === sortBy) ? !this.sortReverse : false;
        this.sortBy = sortBy;

      };

      this.getReverse = (sortBy) => {
        return (this.sortBy === sortBy) ? !this.sortReverse : false;
      };

    }


  }

  angular.module('marketWatcherApp')
    .component('symbolsGrid', {
      templateUrl: 'app/symbolsGrid/symbolsGrid.html',
      controller: SymbolsGridComponent,
      controllerAs: 'symbolsGridCtrl'
    });

})();
