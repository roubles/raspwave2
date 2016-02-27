angular.module('notifications', ['ui.bootstrap', 'ngRoute', 'smart-table',
        'common', 'notificationServiceProvider'
    ])
    .config(['$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }])
    .controller('notificationsCtrl', function($scope, $controller, $http,
        $location, $window, commonService, notificationService) {

        // Implement abstract methods
        $scope.itemMethods = notificationService

        // Multiple inheritance in an non OO language
        $controller('commonCtrl', {
            $scope: $scope
        });

        $controller('commonListCtrl', {
            $scope: $scope
        });
    });
