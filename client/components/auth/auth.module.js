'use strict';

angular.module('marketWatcherApp.auth', ['marketWatcherApp.constants', 'marketWatcherApp.util',
    'ngCookies', 'ui.router'
  ])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
