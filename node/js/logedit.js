angular.module('logedit', ['ngMessages', 'ui.bootstrap'])
.controller('logeditCtrl', function($scope, $http, $location, $window, $uibModal) {

    var changeLocation = function(url, forceReload) {
        $scope = $scope || angular.element(document).scope();
        if(forceReload || $scope.$$phase) {
            window.location = url;
        }
        else {
            //only use this if you want to replace the history stack
            //$location.path(url).replace();

            //this this if you want to change the URL and add it to the history stack
            $location.path(url);
            $scope.$apply();
        }
    };

    var refresh = function () {
        $http.get('/api/logs?skip=' + $scope.skip + "&limit=" + $scope.limit)
            .success(function(data) {
                $scope.logs = data;
                $scope.size = $scope.logs.length
            })
            .error(function(data) {
                console.log('Error: ' + JSON.stringify(data));
                $scope.displayError(JSON.stringify(data))
            });
    };

    $scope.setSelected = function(item) {
        changeLocation('/ui/logs/edit#?id=' + item._id)
    };

    $scope.get = function () {
        if (!$location.search().id) {
            return
        }
        $http.get('/api/logs/' + $location.search().id)
            .success(function(data) {
                if (data) {
                    $scope.log = data;
                    $scope._id = $scope.log._id
                    $scope.date = $scope.log.date
                    $scope.level = $scope.log.level
                    $scope.message = $scope.log.message
                    $scope.transaction = $scope.log.transaction
                }
            })
            .error(function(data) {
                console.log('Error: ' + JSON.stringify(data));
                $scope.displayError(JSON.stringify(data))
            });
    };
    $scope.get()

    $scope.create = function () {
        var data = {
            level: $scope.level,
            message: $scope.message,
            transaction: $scope.transaction
        }

        $http.post("/api/logs/", JSON.stringify(data))
            .success(function(data) {
                changeLocation('/ui/logs')
            })
            .error(function(data) {
                $scope.displayError(JSON.stringify(data))
            });
    };

    $scope.delete = function () {
        $http.delete("/api/logs/" + $scope._id)
            .success(function(data) {
                changeLocation('/ui/logs')
            })
            .error(function(data) {
                console.log('Error: ' + JSON.stringify(data));
                $scope.displayError(JSON.stringify(data))
            });
    };

    $scope.displayError = function(err) {
      var ModalInstanceCtrl = function($scope, $uibModalInstance) {
        $scope.dismiss = function() {
          $uibModalInstance.dismiss('cancel');
        };
      };

      var modalHtml = '<div class="modal-body">' + err + '</div>';
      modalHtml += '<div class="modal-footer"><button class="btn btn-primary" ng-click="dismiss()">DISMISS</button></div>';

      var modalInstance = $uibModal.open({
          template: modalHtml,
          controller: ModalInstanceCtrl
      });

      modalInstance.result.then(function() {
      }, function() {
          //Modal dismissed
      });
    }
})
.directive('ngReallyClick', ['$uibModal',
    function($uibModal) {

      var ModalInstanceCtrl = function($scope, $uibModalInstance) {
        $scope.ok = function() {
          $uibModalInstance.close();
        };

        $scope.cancel = function() {
          $uibModalInstance.dismiss('cancel');
        };
      };

      return {
        restrict: 'A',
        scope:{
          ngReallyClick:"&",
          item:"="
        },
        link: function(scope, element, attrs) {
          element.bind('click', function() {
            var message = attrs.ngReallyMessage || "Are you sure?";

            var modalHtml = '<div class="modal-body">' + message + '</div>';
            modalHtml += '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button><button class="btn btn-warning" ng-click="cancel()">Cancel</button></div>';

            var modalInstance = $uibModal.open({
              template: modalHtml,
              controller: ModalInstanceCtrl
            });

            modalInstance.result.then(function() {
              scope.ngReallyClick({item:scope.item}); //raise an error : $digest already in progress
            }, function() {
              //Modal dismissed
            });
            //*/
            
          });

        }
      }
    }
  ]);
