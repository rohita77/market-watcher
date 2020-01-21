'use strict';

angular.module('marketWatcherApp')
  .directive('footer', function() {
    /*@ngInject*/
    return {
      templateUrl: 'components/footer/footer.html',
      restrict: 'E',
      link: function(scope, element) {
        element.addClass('footer');
      }
    };
  });
