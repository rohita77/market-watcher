'use strict';

function addOption(strike,callOrPut,scope, kite) {
  // Add a option to the basket

  let oc = scope.oc;
  let lotSize = scope.symbol.frontMonthLotSize;
  let optType = (callOrPut === 'C') ? 'call' : 'put';
  let askPrice = strike[optType].ask;

  let tradingSymbol = `${oc.symbol}${oc.expDt.slice(7,9)}${oc.expDt.slice(2,5)}${strike.price}${(callOrPut==='C')?'CE':'PE'}`;

  kite.connect.add({
    exchange: 'NFO',
    tradingsymbol: tradingSymbol,
    quantity: lotSize,
    transaction_type: 'SELL',
    order_type: 'LIMIT',
    price: askPrice
  });

  alert(`Added ${lotSize} of ${tradingSymbol} at ${askPrice}`);

}

function getMoneynessClass(sp, call = false, scope) {
  let baseClass = ' ', c;

  if (call) {
    if (sp <= scope.ltp) c = baseClass + 'active';
    else if (sp >= scope.sdH) c = baseClass + 'success';
    else if (sp >= scope.expH) c = baseClass + 'warning';
    else if (sp >= scope.ltp) c = baseClass + 'danger';
    else c = baseClass + 'default';
  }
  else {
    if (sp >= scope.ltp) c = baseClass + 'active';
    else if (sp <= scope.sdL) c = baseClass + 'success';
    else if (sp <= scope.expL) c = baseClass + 'warning';
    else if (sp <= scope.ltp) c = baseClass + 'danger';
    else c = baseClass + 'default';
  }

  return c;

}

(function () {

  angular.module('marketWatcherApp.option-chain', [])
    .directive('optionChain', ['$log', '$interval', '$resource', '$sce', '$anchorScroll', '$location', 'kite', function ($log, $interval, $resource, $sce, $anchorScroll, $location, kite) {
      return {
        templateUrl: 'components/option-chain/option-chain.html',
        // bindings: { symbol: '>symbol' },
        scope: { symbol: '=' },
        // controller: optionChainComponent,
        // controllerAs: 'ctrl',

        link: function (scope, element, attrs) {

          scope.$location = $location;
          scope.$anchorScroll = $anchorScroll;

          scope.kite = kite;

          scope.ltp = scope.symbol.quote.ltP;

          scope.expH = scope.symbol.quote.expectedHigh;
          scope.expL = scope.symbol.quote.expectedLow;

          scope.sdH = scope.symbol.quote.expectedHigh + (scope.ltp - scope.expL);
          scope.sdL = scope.symbol.quote.expectedLow - (scope.expH - scope.ltp);

          scope.sdH2 = scope.sdH + (1*(scope.sdH - scope.ltp));
          scope.sdL2 = scope.sdL - (1*(scope.ltp - scope.sdL));

          let ocData = $resource(`api/option-chains/${scope.symbol.symbol}`);

          scope.addCallOption = (strike) => addOption(strike, 'C',scope, kite);
          scope.addPutOption = (strike) => addOption(strike, 'P',scope, kite);
          scope.getMoneynessClass = (sp, call = false) => getMoneynessClass(sp, call, scope);

          ocData.get().$promise
            .then((data) => {
              scope.oc = data.data[0];


              let hash = $location.hash(`anchor${scope.symbol.quote.expectedLowOptions.price.toString()}`);
              scope.$anchorScroll(hash);

            });

        }
      };
    }]);



})();

