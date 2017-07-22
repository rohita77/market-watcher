'use strict';

//import routes from './events.routes';

(function() {

  class EventsComponent {
  /*@ngInject*/
  constructor($log, $interval, $resource, $sce) {
    this.message = 'Hello';

    let tgtDate = new Date();

    let tgtDateString = tgtDate.toLocaleDateString('en-US');

    let eventsData = $resource(`/api/board-meetings/?tgtDate=${tgtDateString}&watchlists=NIFTY200`);

      eventsData.get().$promise
        .then((data) => {
          this.events = data.data;
          });


  }
}

angular.module('marketWatcherApp.events', ['ui.router'])
  //.config(routes)
  .component('events', {
    templateUrl: 'app/events/events.html',
    controller: EventsComponent,
    controllerAs: 'eventsCtrl'
  })
  .name;
})();
