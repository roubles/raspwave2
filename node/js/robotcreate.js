angular.module('robots', ['ui.bootstrap', 'common',
        'robotServiceProvider'
    ])
    .config(['$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }])
    .controller('robotCreateCtrl', function($scope, $controller,
        $http, $location, $window, commonService, robotService) {

        // Implement abstract methods
        $scope.itemMethods = robotService

        // Multiple inheritance in an non OO language
        $controller('commonCtrl', {
            $scope: $scope
        });

        $controller('commonAddCtrl', {
            $scope: $scope
        });
    });