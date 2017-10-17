'use strict';

angular.module('marketWatcherApp')
  .factory('Modal', function ($rootScope, $uibModal, $state) {
    /**
     * Opens a modal
     * @param  {Object} scope      - an object to be merged with modal's scope
     * @param  {String} modalClass - (optional) class(es) to be applied to the modal
     * @return {Object}            - the instance $uibModal.open() returns
     */
    function openModal(scope = {}, modalClass = 'modal-default') {
      var modalScope = $rootScope.$new();

      angular.extend(modalScope, scope);

      // modalScope.symbol1 = 'ARE3';

      return $uibModal.open({
        //templateUrl: 'components/modal/modal.html',
        template: '<modal><events symbol="data">',
        windowClass: modalClass,
        scope: modalScope,
      });
    }

    // Public API here
    return {

      /* Confirmation modals */
      confirm: {

        /**
         * Create a function to open a delete confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
         * @param  {Function} del - callback, ran when delete is confirmed
         * @return {Function}     - the function to open the modal (ex. myModalFn)
         */
        delete(del = angular.noop) {
          /**
           * Open a delete confirmation modal
           * @param  {String} name   - name or info to show on modal
           * @param  {All}           - any additional args are passed straight to del callback
           */
          return function () {
            var args = Array.prototype.slice.call(arguments),
              name = args.shift(),
              deleteModal;

            deleteModal = openModal({
              modal: {
                dismissable: true,
                title: 'Confirm Delete',
                html: '<p>Are you sure you want to delete <strong>' + name +
                '</strong> ?</p>',
                buttons: [{
                  classes: 'btn-danger',
                  text: 'Delete',
                  click: function (e) {
                    deleteModal.close(e);
                  }
                }, {
                  classes: 'btn-default',
                  text: 'Okay',
                  click: function (e) {
                    deleteModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-danger');

            deleteModal.result.then(function (event) {
              del.apply(event, args);
            });


          };
        },

        /**
         * Create a function to open a ok confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
         * @param  {Function} del - callback, ran when ok is confirmed
         * @return {Function}     - the function to open the modal (ex. myModalFn)
         */
        ok(del = angular.noop) {
          /**
           * Open a ok confirmation modal
           * @param  {String} name   - name or info to show on modal
           * @param  {All}           - any additional args are passed straight to del callback
           */
          return function () {
            var args = Array.prototype.slice.call(arguments),
              name = args.shift(),
              symbol = args.shift(),
              okModal;
            okModal = openModal({
              modal: {
                dismissable: true,
                title: name + symbol.symbol,
                html: '<p>Are you sure you want to ok <strong>' + name +
                '</strong> ?</p>',
                buttons: [{
                  classes: 'btn-default',
                  text: 'Okay',
                  click: function (e) {
                    okModal.dismiss(e);
                  }
                }]
              },
              data : symbol
            }, 'modal-danger');

            okModal.result.then(function (event) {
              del.apply(event, args);
            });


          };
        }


      }
    };
  });


angular.module('marketWatcherApp')
  .directive('modal', () => ({
    restrict: 'E',
    transclude: true,
    templateUrl: 'components/modal/modal.html',

  }));

