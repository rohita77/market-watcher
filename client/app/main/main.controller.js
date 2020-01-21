'use strict';

(function () {

  class MainController {

    constructor($http, $scope, socket) {
      this.$http = $http;
      this.socket = socket;
      this.awesomeThings = [];

      $scope.$on('$destroy', function () {
        socket.unsyncUpdates('thing');
      });

      $scope.quotes = [];

      $scope.quotes.push({ symbol: 'VIX', last: 15.1, perChangeSize: '1u', perChange: 2.2 });
      $scope.quotes.push({ symbol: 'NIFTY 50', last: 8325, perChangeSize: '1u', perChange: 1.2 });
      $scope.quotes.push({ symbol: 'INFY', last: 1050, perChangeSize: '3d', perChange: -10.3 });

      $scope.quotes.push({ symbol: 'AXISBANK', last: 592.75, perChangeSize: '1u', perChange: 1.6 });
      $scope.quotes.push({ symbol: 'TCS', last: 2653.55, perChangeSize: '3u', perChange: -12.4 });
      $scope.quotes.push({ symbol: 'COALINDIA', last: 346.20, perChangeSize: '2u', perChange: 2.5 });
      $scope.quotes.push({ symbol: 'ACC', last: 1644.75, perChangeSize: '1d', perChange: -1.2 });
      $scope.quotes.push({ symbol: 'BHEL', last: 135, perChangeSize: '2d', perChange: -4.2 });
      $scope.quotes.push({ symbol: 'LT', last: 1494.10, perChangeSize: '1d', perChange: -0.8 });


      $scope.getQuote = (symbol) => {
        return $scope.quotes.find((quote) => {
          return quote.symbol.match(
            new RegExp('^' + symbol + '$'));
        });

        };

    }

    $onInit() {
      this.$http.get('/api/things')
        .then(response => {
          this.awesomeThings = response.data;
          this.socket.syncUpdates('thing', this.awesomeThings);
        });
    }

    addThing() {
      if (this.newThing) {
        this.$http.post('/api/things', {
          name: this.newThing
        });
        this.newThing = '';
      }
    }

    deleteThing(thing) {
      this.$http.delete('/api/things/' + thing._id);
    }
  }

  angular.module('marketWatcherApp')
    .component('main', {
      /*@ngInject*/
      templateUrl: 'app/main/main.html',
      controller: MainController
    });
})();
