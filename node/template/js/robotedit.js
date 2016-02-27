angular.module('robots', ['ui.bootstrap', 'common',
        'robotServiceProvider'
    ])
    .config(['$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }])
    .controller('robotEditCtrl', function($scope, $controller, $http,
        $location, $window, $uibModal, commonService,
        robotService) {
        // Implement abstract methods
        $scope.itemMethods = robotService

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