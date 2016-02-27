angular.module('nodeedit', ['ngMessages', 'ui.bootstrap'])
.controller('nodeeditCtrl', function($scope, $http, $location, $window, $uibModal) {

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
        $http.get('/api/nodes?skip=' + $scope.skip + "&limit=" + $scope.limit)
            .success(function(data) {
                $scope.nodes = data;
                $scope.size = $scope.nodes.length
            })
            .error(function(data) {
                console.log('Error: ' + JSON.stringify(data));
                $scope.displayError(JSON.stringify(data))
            });
    };

    $scope.setSelected = function(item) {
        changeLocation('/ui/nodes/edit#?nodeId=' + item.nodeId)
    };

    $scope.get = function () {
        $http.get('/api/nodes/' + $location.search().nodeId)
            .success(function(data) {
                if (data) {
                    $scope.node = data;
                    $scope.nodeId = $scope.node.nodeId
                    $scope.name = $scope.node.name
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
            nodeId: $scope.nodeId,
            name: $scope.name
        }
        $http.post("/api/nodes/", JSON.stringify(data))
            .success(function(data) {
                changeLocation('/ui/nodes')
            })
            .error(function(data) {
                console.log('Error: ' + JSON.stringify(data));
                $scope.displayError(JSON.stringify(data))
            });
    };

    $scope.save = function () {
        var data = {
            nodeId: $scope.nodeId,
            name: $scope.name
        } 
        $http.put("/api/nodes/" + $scope.nodeId, JSON.stringify(data))
            .success(function(data) {
                changeLocation('/ui/nodes')
            })
            .error(function(data) {
                console.log('Error: ' + JSON.stringify(data));
                $scope.displayError(JSON.stringify(data))
            });
    };

    $scope.delete = function () {
        $http.delete("/api/nodes/" + $scope.nodeId)
            .success(function(data) {
                changeLocation('/ui/nodes')
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
