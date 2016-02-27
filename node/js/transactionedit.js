angular.module('transactionedit', ['ngMessages', 'ui.bootstrap'])
.controller('transactioneditCtrl', function($scope, $http, $location, $window, $uibModal) {

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
        $http.get('/api/transactions?skip=' + $scope.skip + "&limit=" + $scope.limit)
            .success(function(data) {
                $scope.transactions = data;
                $scope.size = $scope.transactions.length
            })
            .error(function(data) {
                console.log('Error: ' + JSON.stringify(data));
                $scope.displayError(JSON.stringify(data))
            });
    };

    $scope.setSelected = function(item) {
        changeLocation('/ui/transactions/edit#?id=' + item._id)
    };

    $scope.get = function () {
        if (!$location.search().id) {
            return
        }
        $http.get('/api/transactions/' + $location.search().id)
            .success(function(data) {
                if (data) {
                    $scope.transaction = data;
                    $scope._id = $scope.transaction._id
                    $scope.submitted_time = $scope.transaction.submitted_time
                    $scope.started_time = $scope.transaction.started_time
                    $scope.completed_time = $scope.transaction.completed_time
                    $scope.state = $scope.transaction.state
                    $scope.description = $scope.transaction.description
                    $scope.parent = $scope.transaction.parent
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
            state: $scope.state,
            started_time: $scope.started_time,
            completed_time: $scope.completed_time,
            description: $scope.description,
            parent: $scope.parent
        }

        console.log("creating: " + JSON.stringify(data))
        $http.post("/api/transactions/", JSON.stringify(data))
            .success(function(data) {
                changeLocation('/ui/transactions')
            })
            .error(function(data) {
                console.log('Error: ' + JSON.stringify(data));
                $scope.displayError(JSON.stringify(data))
            });
    };

    $scope.save = function () {
        var data = {
            state: $scope.state,
            submitted_time: $scope.submitted_time,
            started_time: $scope.started_time,
            completed_time: $scope.completed_time,
            description: $scope.description,
            parent: $scope.parent
        } 
        console.log("Creating: " + JSON.stringify(data))
        $http.put("/api/transactions/" + $scope._id, JSON.stringify(data))
            .success(function(data) {
                changeLocation('/ui/transactions')
            })
            .error(function(data) {
                console.log('Error: ' + JSON.stringify(data));
                $scope.displayError(JSON.stringify(data))
            });
    };

    $scope.delete = function () {
        $http.delete("/api/transactions/" + $scope._id)
            .success(function(data) {
                changeLocation('/ui/transactions')
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
