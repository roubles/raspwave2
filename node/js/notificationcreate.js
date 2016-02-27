angular.module('notifications', ['ui.bootstrap', 'common',
        'notificationServiceProvider'
    ])
    .config(['$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }])
    .controller('notificationCreateCtrl', function($scope, $controller,
        $http, $location, $window, commonService, notificationService) {

        // Implement abstract methods
        $scope.itemMethods = notificationService

        // Multiple inheritance in an non OO language
        $controller('commonCtrl', {
            $scope: $scope
        });

        $controller('commonAddCtrl', {
            $scope: $scope
        });
    });
