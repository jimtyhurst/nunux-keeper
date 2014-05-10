/* global angular, alert */

'use strict';

angular.module('ProfileModule', [])
.directive('appProfile', ['$location', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'templates/components/profile.html',
    controller: 'ProfileCtrl'
  };
}])
.controller('ProfileCtrl', [
  '$scope', '$location', '$routeParams', 'userService',
  function ($scope, $location, $routeParams, userService) {
    if ($routeParams.error) {
      $scope.message = {clazz: 'alert-danger', text: $routeParams.error};
    } else if ($routeParams.info) {
      $scope.message = {clazz: 'alert-success', text: $routeParams.info};
    }

    userService.get().then(function(user) {
      $scope.user = user;
      userService.getLinkedApp($scope.user).then(function(apps) {
        $scope.apps = apps;
      });
    });
    $scope.realm = $location.protocol() + '://' + $location.host() + ($location.port() === 80 ? '' : ':' + $location.port());
  }
]);

