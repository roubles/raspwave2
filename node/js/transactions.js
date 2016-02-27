angular.module('transactions', ['ui.bootstrap'])
.controller('transactionsCtrl', function($scope, $http, $location, $window) {
    $scope.formData = {};
    $scope.sortType = 'ignore';
    $scope.skip = 0
    $scope.limit = 5
    $scope.size = 0

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

    refresh()

    $scope.setSelected = function(item) {
        changeLocation('/ui/transactions/edit#?id=' + item._id)
    };

    $scope.prevPage = function () {
        if ($scope.skip > 0) {
            $scope.skip = $scope.skip - $scope.limit;
            refresh();
        }
    };

    $scope.nextPage = function () {
        if ($scope.size == 5) {
            $scope.skip = $scope.skip + $scope.limit;
            refresh();
        }
    };

    $scope.delete = function (transaction) {
        $http.delete("/api/transactions/" + transaction._id)
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

