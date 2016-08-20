'use strict';

class NavbarController {
  //end-non-standard

  //start-non-standard
  constructor(Auth,$scope) {
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;
    this.menu = [{state:'symbolsGrid',title:'Grid'}];
    this.isCollapsed = true;

    $scope.navClose = () => {
      this.isCollapsed = true;
    }

  }

}

angular.module('marketWatcherApp')
  .controller('NavbarController', NavbarController);
