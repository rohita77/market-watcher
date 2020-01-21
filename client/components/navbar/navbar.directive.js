'use strict';

angular.module('marketWatcherApp')
  .directive('navbar', () => ({
          /*@ngInject*/

    transclude:true,
    templateUrl: 'components/navbar/navbar.html',
    restrict: 'E',
    controller: 'NavbarController',
    controllerAs: 'nav'
  }));
