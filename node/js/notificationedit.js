angular.module('notifications', ['ui.bootstrap', 'common',
        'notificationServiceProvider'
    ])
    .config(['$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }])
    .controller('notificationEditCtrl', function($scope, $controller, $http,
        $location, $window, $uibModal, commonService,
        notificationService) {
        // Implement abstract methods
        $scope.itemMethods = notificationService

        // Multiple inheritance in an non OO language
        $controller('commonCtrl', {
            $scope: $scope
        });

        $controller('commonEditCtrl', {
            $scope: $scope
        });

        $scope.delete = function() {
            return $scope.deleteById($scope.item._id)
        };
    });
