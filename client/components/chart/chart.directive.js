'use strict';
//const angular = require('angular');

angular.module('marketWatcherApp.chart', [])
  .directive('chart', function () {
    return {
      templateUrl: 'components/chart/chart.html',
      transclude: true,
      restrict: 'EA',

      link: function (scope, element, attrs) {
        new TradingView.widget({
          'container_id': 'chart',
          // 'width': 980,
          // 'height': 610,
          'autosize': true,
          'symbol': `NSE:${scope.data.symbol}`,
          'interval': 'D',
          'timezone': 'Asia/Kolkata',
          'theme': 'Dark',
          'style': '1',
          'locale': 'en',
          'enable_publishing': false,
            'hideideas': true,
          //   'calendar':true,
            'hide_top_toolbar' : false,
          'withdateranges' : true,
            'show_popup_button': true,
          //   'popup_width': '1000',
          //   'popup_height': '650',
            'fullscreen' : true,
          //   'news' : [
          // 'headlines'
          //   ],
            'studies': [
              'MAExp@tv-basicstudies',
            ],
            'time_frames': [
              { text: '50y', resolution: '6M' },
              { text: '3y', resolution: 'W' },
              { text: '8m', resolution: 'D' },
              { text: '3d', resolution: '5' },
          ],
            'studies_overrides': {
              'moving average exponential.length' : 21,
              'moving average exponential.linewidth' : 20
          },
          // charts_storage_url: 'http://saveload.tradingview.com',
              client_id: 'tradingview.com',
              user_id: 'rohita77',
        });


      }
    };
  });


