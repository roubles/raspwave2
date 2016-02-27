angular.module('robots', ['ui.bootstrap', 'ngRoute', 'smart-table',
        'common', 'robotServiceProvider'
    ])
    .config(['$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }])
    .controller('robotsCtrl', function($scope, $controller, $http,
        $location, $window, commonService, robotService) {

        // Implement abstract methods
        $scope.itemMethods = robotService

        // Multiple inheritance in an non OO language
        $controller('commonCtrl', {
            $scope: $scope
        });

        $controller('commonListCtrl', {
            $scope: $scope
        });
    });