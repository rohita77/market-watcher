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

      //TD: Not used
      this.betaFilterOptions = [
        { 'value': undefined, 'label': 'All' },
        { 'value': 0.5, 'label': 'less than 0.5' },
        { 'value': 1, 'label': 'between 0.5 and 1.5' },
        { 'value': 1.5, 'label': 'greater than 1.5' },
      ];

      //var watchlistsData = this.$resource('/api/watchlists');

      //GetSymbols
      //let watchlistData = this.$resource('/api/watchlists/NIFTY100');

      let symbolsData = this.$resource('/api/symbols/?watchlists=NIFTY100');

      symbolsData.get().$promise
        .then((data) => {
          this.watchlist = {
            name: 'NIFTY100',
            symbols: data.data
          };

          console.log(`watchlist: ${this.watchlist.name} has ${this.watchlist.symbols.length} symbols`);

          this.watchlist.symbols.forEach(symbol => {

            // symbol.key = symbol.symbol + ':' + symbol.name;
            symbol.key = [symbol.symbol, symbol.name, symbol.industry];

            //Move to Server and use moment
            //symbol.daysToEarnings = moment(symbol.projectedEarnings).diff(moment(), 'days');
            let MsInADay = 24 * 60 * 60 * 1000;
            symbol.daysToEarnings = Math.ceil((new Date(symbol.projectedEarnings) - (new Date())) / MsInADay);
            symbol.daysToEarnings = (symbol.daysToEarnings <= 0) ? undefined : symbol.daysToEarnings;

            //To fix sorting issue when quotes are missing
            //no match?
          });

          this.refreshQuoteData(true);

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

    refreshQuoteData(isFirstCall) {
      //not working
      let quoteData = this.$resource('/api/quotes'); //niftyStockWatch

      //TD: Refreshing only Data and not Symbols?
      quoteData.get().$promise
        .then((data) => {
          //      this.quotes = data;
          this.quoteTime = data.quoteTime;
          this.refreshTime = data.refreshTime;

          if (isFirstCall) {
            this.sortBy = 'quote.per';
            this.sortReverse = false;
            console.log('first quotes reresh: number of quotes: ' + data.quotes.length);
          }

          //Start error for sort/match
          //       if (this.watchlist == undefined)  {
          //         this.watchlist = this.watchlistInit;
          //       }

          this.watchlist.symbols.forEach(symbol => {
            symbol.quote = data.quotes.find(quote => {
              return quote.symbol.match(
                new RegExp('^' + symbol.symbol + '$'));
            });
            //no match?
            if (symbol.quote === undefined) {
              symbol.quote = {
                'symbol': '',
                'open': '0',
                'high': '0',
                'low': '0',
                'ltP': '0',
                'ptsC': '0',
                'per': '0',
                'trdVol': '0',
                'trdVolM': '0',
                'ntP': '0',
                'mVal': '0',
                'wkhi': '0',
                'wklo': '0',
                'wkhicm_adj': '0',
                'wklocm_adj': '0',
                'xDt': '',
                'cAct': '-',
                'yPC': '0',
                'mPC': '0'
              };
            };

            let callROC = 0, putROC = 0;

            if (+symbol.quote.expectedHighPercent > 0 && symbol.quote.expectedHighOptions) {
              callROC = (+symbol.quote.expectedHighOptions.call.percentSpread < 11) ? +symbol.quote.expectedHighCallROCPercent||0 : 0;
            }

            if (+symbol.quote.expectedLowPercent > 0 && symbol.quote.expectedLowOptions) {
              putROC = (+symbol.quote.expectedLowOptions.put.percentSpread  < 11) ? +symbol.quote.expectedLowPutROCPercent || 0 : 0;
            }

            // console.log(symbol.symbol + ':' + symbol.quote.ROC + ':C: ' + callROC  + ':P: ' + putROC  );
            symbol.quote.ROC = Math.max(+callROC || 0, +putROC || 0);
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
