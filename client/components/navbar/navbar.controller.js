'use strict';

class NavbarController {
  //end-non-standard

  //start-non-standard
  constructor(Auth, $scope, kite) {
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;
    this.menu = [{ state: 'symbolsGrid', title: 'Grid' }, { state: 'market-analysis', title: 'Analysis' }];
    this.isCollapsed = true;

    $scope.navClose = () => {
      this.isCollapsed = true;
    };

    $scope.quotes = [];

    $scope.quotes.push({ symbol: 'VIX', last: 15.1, perChangeSize: '1u', perChange: 2.2 });
    $scope.quotes.push({ symbol: 'NIFTY 50', last: 8325, perChangeSize: '1u', perChange: 1.2 });
    $scope.quotes.push({ symbol: 'INFY', last: 1050, perChangeSize: '3d', perChange: -10.3 });

    $scope.getQuote = (symbol) => {
      return $scope.quotes.find((quote) => {
        return quote.symbol.match(
          new RegExp('^' + symbol + '$'));
      });

    };

    //$scope.hi();

    KiteConnect.ready(() => {
      // Initialize a new Kite instance.
      // You can initialize multiple instances if you need.
      kite.connect = new KiteConnect('34dvxrlj3l08i9tv');

      // Register an (optional) callback.
      // kite.connect.finished(function (status, request_token) {
      //   alert("Finished. Status is " + status);
      // });

      // Render the in-built button inside a given target
      // kite.connect.renderButton("#default-button");

      // OR, link the basket to any existing element you want
      kite.connect.link('#custom-button');
    });


  }

}

angular.module('marketWatcherApp')
      /*@ngInject*/

  .controller('NavbarController', NavbarController);
