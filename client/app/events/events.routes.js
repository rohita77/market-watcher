'use strict';

angular.module('marketWatcherApp.events')
  .config(function($stateProvider) {
    $stateProvider
    .state('events', {
      url: '/events',
      template: '<events></events>'
    });
  });
