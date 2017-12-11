'use strict';

angular.module('marketWatcherApp', ['marketWatcherApp.auth', 'marketWatcherApp.admin',
    'marketWatcherApp.constants', 'ngCookies', 'ngResource', 'ngSanitize', 'btford.socket-io',
    'ui.router', 'ui.bootstrap', 'validation.match','marketWatcherApp.option-chain','marketWatcherApp.chart','marketWatcherApp.market-analysis'])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
  });
