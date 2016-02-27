var app = angular.module('pager', ['ui.bootstrap']);

app.controller('MainCtrl', function($scope) {
  $scope.number_of_change = 0;
  $scope.current_page = 1;
  $scope.items_per_page = 5;
  $scope.total_records = 1000;
  
  $scope.pageChanged = function () {
    ($scope.number_of_change)++;
  };
});
