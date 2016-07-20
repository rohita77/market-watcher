'use strict';

angular.module('marketWatcherApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('symbolsGrid', {
        url: '/symbolsGrid',
        template: '<symbols-grid></symbols-grid>'
      });
  });
