'use strict';

//import routes from './events.routes';

(function () {

        class EventsComponent {
                /*@ngInject*/
                constructor($log, $interval, $resource, $sce, $anchorScroll, $location) {
                        this.$location = $location;
                        this.$anchorScroll = $anchorScroll;

                        this.ltp = this.symbol.quote.ltP;

                        this.expH = this.symbol.quote.expectedHigh;
                        this.expL = this.symbol.quote.expectedLow;

                        this.sdH = this.symbol.quote.expectedHigh + (this.ltp - this.expL);
                        this.sdL = this.symbol.quote.expectedLow - (this.expH - this.ltp);

                        let ocData = $resource(`api/option-chains/${this.symbol.symbol}`);

                        ocData.get().$promise
                                .then((data) => {
                                        this.oc = data.data[0];

                                        let hash = $location.hash(`anchor${this.symbol.quote.expectedLowOptions.strikePrice.toString()}`);
                                        this.$anchorScroll(hash);

                                });



                }

                $onInit() {

                }
                getMoneyClass(sp, call = false) {
                        let baseClass = ' ', c;

                        if (call) {
                                if (sp <= this.ltp) c = baseClass + 'active';
                                else if (sp >= this.sdH) c = baseClass + 'success';
                                else if (sp >= this.expH) c = baseClass + 'warning';
                                else if (sp >= this.ltp) c = baseClass + 'danger';
                                else c = baseClass + 'default';
                        }
                        else {
                                if (sp >= this.ltp) c = baseClass + 'active';
                                else if (sp <= this.sdL) c = baseClass + 'success';
                                else if (sp <= this.expL) c = baseClass + 'warning';
                                else if (sp <= this.ltp) c = baseClass + 'danger';
                                else c = baseClass + 'default';
                        }

                        return c;

                }

        }





        angular.module('marketWatcherApp.events', ['ui.router'])
                //.config(routes)
                .component('events', {
                        templateUrl: 'app/events/events.html',
                        controller: EventsComponent,
                        controllerAs: 'eventsCtrl',
                        bindings: {
                                symbol: '<symbol'
                        }
                })
                .name;
})();



