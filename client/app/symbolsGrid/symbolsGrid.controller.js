'use strict';

(function () {


  class SymbolsGridComponent {
    constructor($log, $interval, $resource, $sce, $anchorScroll, $location, Modal) {
      this.$resource = $resource;
      this.$interval = $interval;
      this.$log = $log;
      this.$location = $location;
      this.$anchorScroll = $anchorScroll;
      this.Modal = Modal;

      this.filterIsCollapsed = true;
      this.sortBy = 'symbol';
      this.sortReverse = false;
      this.incEarnings = false;

      this.selectedWatchlist = {
        _id :  'NIFTY100',
        name : 'NIFTY 100 Index'
      }

      this.query = {
        watchlists: 'NIFTY100'
      };

      //Watchlists
      let watchlistData = this.$resource('/api/watchlists');

      watchlistData.get().$promise
        .then((data) => {
          this.watchlistChoices = data.data;
        });


      //TD: Select from Drop Down
      let symbolsData = this.$resource('/api/symbols');

      symbolsData.get().$promise
        .then((data) => {
          this.watchlist = {
            name: 'NIFTY100', //TD: move to server
            symbols: data.data
          };

          this.$log.info(`Retrieved watchlist ${this.watchlist.name} with ${this.watchlist.symbols.length} symbols`);

          this.watchlist.symbols = this.watchlist.symbols.map(symbol => {

            // let symbol = Object.assign(symbol1);
            symbol.key = [symbol.symbol, symbol.name, `(${symbol.industry})`];

            return symbol;

          });

          //TD: Emit from Server instead of client refresh
          this.refreshQuoteData(true);

          let refreshQuoteDataPromise = this.$interval(this.refreshQuoteData.bind(this), 5 * 60 * 1000);


        }) //based on format
        .catch((data, status, headers, config) => {
          this.$log.warn(data, status, headers, config);
        });

        this.getSortOrder =  (symbol) => {

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

    }

    filterIndustry(symbol) {
      this.query.key = (this.query.key == `(${symbol.industry})`) ? '' :  `(${symbol.industry})`;
    }


    changeWatchlist(choice) {
      this.query.watchlists=choice._id;
      this.selectedWatchlist = choice;

    }

    toggleSelectedSymbol(symbol) {
      this.selectedSymbol = symbol;

      let hash = this.$location.hash(`anchor-${symbol}`);
      this.$anchorScroll(hash);
      this.$anchorScroll.yOffset = 60;

    }


    setSortBy (sortBy) {
      this.sortReverse = (this.sortBy === sortBy) ? !this.sortReverse : false;
      this.sortBy = sortBy;

    };

    getReverse (sortBy) {
      return (this.sortBy === sortBy) ? !this.sortReverse : false;
    };

    $onInit() {
      this.filterIsCollapsed = true;
    }

    refreshQuoteData(isFirstCall) {

      let quoteData = this.$resource('/api/quotes'); //TD: Pass Select Watchlist name

      //TD: Refreshing only Data and not Symbols?
      quoteData.get().$promise
        .then((resData) => {
          let data = resData.data[0];
          this.quoteTime = data.quoteTime;
          this.refreshTime = data.refreshTime;

          if (isFirstCall) {
            this.sortBy = 'quote.maxROC';
            this.sortReverse = false;

            this.$log.info(`First Call retrieved ${data.quotes.length} quotes`);
          }

          this.watchlist.symbols = this.watchlist.symbols.filter(symbol => {
          // this.watchlist.symbols = this.watchlist.symbols.map(symbol => {
          // this.watchlist.symbols.forEach(symbol => {

            // let symbol = Object.assign(symbol1);
            let symbolRegEx = new RegExp('^' + symbol.symbol + '$');

            let quote = data.quotes.find(
              quote => quote.symbol.match(symbolRegEx)
            );


            symbol.quote = quote || {};
            // return symbol;
            return ((symbol.quote.expectedHighPercent > 0 ) && ((symbol.quote.ntP > 40) || (symbol.quote.trdVol > 5)) );

          });
          console.log(this.watchlist.symbols.length);
          console.log(this.watchlist.symbols);
        }) //based on format
        .catch((data, status, headers, config) => {
          this.$log.warn(data, status, headers, config);
        });

    }



    openOC(symbol) {

      let template = `<option-chain symbol="data">`;

      return this.Modal.confirm.ok(function (formData) {

        // formData contains the data collected in the modal

      })(`Option Chain for ${symbol.symbol} (15 min delayed)`, symbol, template);


    }

    openChart(symbol) {

      let template = `<chart symbol="data">`;

      return this.Modal.confirm.ok(function (formData) {

        // formData contains the data collected in the modal

      })(`Chart ( EOD / Delayed ) For ${symbol.symbol}`, symbol, template);


    }



  }


  angular.module('marketWatcherApp')
    .component('symbolsGrid', {
      templateUrl: 'app/symbolsGrid/symbolsGrid.html',
      controller: SymbolsGridComponent,
      controllerAs: 'symbolsGridCtrl'
    });

})();


