angular.module('common', ['ui.bootstrap'])
    .factory('commonService', function() {
        var tabs = [{
            title: 'Home',
            url: '/ui/home'
        }, {
            title: 'Notifications',
            url: '/ui/notifications'
        }, {
            title: 'Robots',
            url: '/ui/robots'
        }, {
            title: 'Cronbots',
            url: '/ui/cronbots'
        }, {
            title: 'Transforms',
            url: '/ui/transforms'
        }, {
            title: 'Nodes',
            url: '/ui/nodes'
        }, {
            title: 'Transactions',
            url: '/ui/transactions'
        }, {
            title: 'Logs',
            url: '/ui/logs'
        }, {
            title: 'Configs',
            url: '/ui/configs'
        }, ];
        return {
            getTabs: function() {
                return tabs;
            },
            getLimit: function() {
                return 5; // TODO: get from mongo
            },
            removeEndingSlash: function(uri) {
                if (uri.substr(-1) == '/' && uri.length > 1) {
                    var query = uri.slice(uri.length);
                    uri = uri.slice(0, -1) + query;
                }
                return uri
            }
        };
    })
    .controller('commonListCtrl', function($scope, $http, $location,
        $window, $uibModal, commonService) {
        $scope.displayedCollection = [];
        $scope.setItem = function(item) {
            $scope.changeLocation($scope.uiUrl + item._id)
        }
        $scope.deleteByItem = function(widget) {
            var id = widget._id
            return deleteById(id)
        }
        $scope.prevPage = function() {
            if ($scope.skip > 0) {
                $scope.skip = $scope.skip - $scope.limit
                $scope.skip = Math.max(0, $scope.skip)
                $scope.changeLocation($scope.uiUrl + qs())
            }
        }
        $scope.nextPage = function() {
            $scope.skip = $scope.skip + $scope.limit;
            $scope.skip = Math.max(0, $scope.skip);
            $scope.changeLocation($scope.uiUrl + qs())
        }
        $scope.getPage = function(page) {
            $scope.skip = (page - 1) * $scope.limit
            $scope.changeLocation($scope.uiUrl + qs())
        }
        $scope.refresh = function() {
            $scope.limit = isNaN($scope.limit) ? commonService.getLimit() :
                $scope.limit
            $scope.changeLocation($scope.uiUrl + qs())
        }
        $scope.search = function() {
            $scope.changeLocation($scope.uiUrl + qs())
        }
        $scope.initScopeFromQueryParams = function() {
            var query = $location.search()['q']
            var limit = parseInt($location.search()['limit'])
            var skip = parseInt($location.search()['skip'])

            $scope.skip = isNaN(skip) ? 0 : skip
            $scope.limit = isNaN(limit) ? commonService.getLimit() :
                limit
            $scope.q = query
            console.log("skip = " + $scope.skip)
            console.log("limit = " + $scope.limit)
            console.log("q = " + $scope.q)

            $scope.limits = [{
                value: 1,
                label: '1'
            }, {
                value: 5,
                label: '5'
            }, {
                value: 10,
                label: '10'
            }, {
                value: 50,
                label: '50'
            }, {
                value: 100,
                label: '100'
            }, {
                value: 200,
                label: '200'
            }]
        }
        $scope.getItems = function() {
            var qstring = qs()
            console.log("Getting items " + qstring)
            $http.get($scope.apiUrl + qstring)
                .success(function(data) {
                    $scope.count = data.meta.count;
                    $scope.items = data.data;
                    $scope.displayedCollection = [].concat(
                        $scope.items);
                    $scope.currentPage = Math.floor($scope.skip /
                        $scope.limit) + 1;
                    $scope.maxPage = Math.ceil($scope.count /
                        $scope.limit)
                    $scope.initPages()
                })
                .error(function(data) {
                    console.log('Error: ' + JSON.stringify(data));
                    $scope.displayError(JSON.stringify(data))
                });
        }
        var serialize = function(obj) {
            var str = [];
            for (var p in obj)
                if (obj.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + "=" +
                        encodeURIComponent(obj[p]));
                }
            return str.join("&");
        }
        var qs = function() {
            var params = {}
            if ($scope.limit != commonService.getLimit()) {
                params['limit'] = $scope.limit
            }
            if ($scope.skip != 0) {
                params['skip'] = $scope.skip
            }
            if ($scope.q) {
                params['q'] = $scope.q
            }
            var qs = serialize(params)
            if (qs.length > 0) {
                return '?' + qs
            }
            return ""
        }
        $scope.disablePrev = function() {
            if ($scope.currentPage == 1) {
                return true
            }
            return false
        }
        $scope.disableNext = function() {
            if ($scope.currentPage == $scope.maxPage) {
                return true
            }
            return false
        }
        $scope.initPages = function() {
            $scope.pages = []
            var start = Math.max(1, $scope.currentPage - 2)
            var end = Math.min($scope.maxPage, $scope.currentPage +
                2)
            for (var i = start; i <= end; i++) {
                $scope.pages.push(i);
            }
            $scope.maxDisplayed = end
        }
        $scope.rightElipsis = function() {
            var end = Math.min($scope.maxPage, $scope.maxDisplayed +
                2)
            for (var i = $scope.maxDisplayed + 1; i <= end; i++) {
                $scope.pages.push(i);
            }
            $scope.maxDisplayed = end
        }
        $scope.getPageClass = function(page) {
            if (page == $scope.currentPage) {
                return {
                    'active': true
                }
            }
            return ""
        }

        // This is what happens when an old school
        // C programmer writes angulerJS.
        //
        // int main(int argc, char **argv);
        $scope.initScopeFromQueryParams()
        $scope.getItems()
    })
    .controller('commonAddCtrl', function($scope, $http, $location,
        $window, $uibModal, commonService) {
        $scope.create = function() {
            return $scope.createItem($scope.item)
        }
        $scope.createItem = function(item) {
            console.log("Creating: " + $scope.apiUrl)
            console.log("Creating: " + JSON.stringify(item))
            var url = commonService.removeEndingSlash($scope.apiUrl)
            $http.post(url, JSON.stringify({
                    data: item
                }))
                .success(function(data) {})
                    $scope.changeLocation($scope.uiUrl)
                .error(function(data) {
                    console.log('Error: ' + JSON.stringify(
                        data));
                    $scope.displayError(JSON.stringify(data))
                });
        };

        // This is what happens when an old school
        // C programmer writes angulerJS.
        //
        // int main(int argc, char **argv);
        $scope.item = {}
    })
    .controller('commonEditCtrl', function($scope, $http, $location,
        $window, $uibModal) {
        $scope.get = function() {
            var id = $location.path().split("/")[3] ||
                "Unknown"
            console.log("Getting " + $scope.itemName + " " + id)
            $http.get($scope.apiUrl + id)
                .success(function(data) {
                    if (data) {
                        $scope.item = data.data;
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + JSON.stringify(
                        data));
                    $scope.displayError(JSON.stringify(
                        data))
                })
        }
        $scope.save = function() {
            return $scope.saveItem($scope.item)
        }
        $scope.saveItem = function(item) {
            console.log("Saving: " + JSON.stringify(item))
            $http.put($scope.apiUrl + item._id, JSON.stringify({
                    data: item
                }))
                .success(function(data) {
                    $scope.changeLocation($scope.uiUrl)
                })
                .error(function(data) {
                    console.log('Error: ' + JSON.stringify(
                        data));
                    $scope.displayError(JSON.stringify(data))
                });
        }

        // This is what happens when an old school
        // C programmer writes angulerJS.
        //
        // int main(int argc, char **argv);
        $scope.get();
    })
    .controller('commonCtrl', function($scope, $http, $location,
        $window, $uibModal, commonService) {

        $scope.deleteById = function(id) {
            console.log("Deleting " + $scope.itemName + " " + id)
            $http.delete($scope.apiUrl + id)
                .success(function(data) {
                    $scope.changeLocation($scope.uiUrl)
                })
                .error(function(data) {
                    console.log('Error: ' + JSON.stringify(
                        data));
                    $scope.displayError(JSON.stringify(
                        data))
                })
        }

        $scope.getPrettyItem = function() {
            return JSON.stringify($scope.item, null, 4)
        }

        $scope.getTabs = function() {
            return commonService.getTabs()
        }

        $scope.getTabClass = function(tab, title) {
            if (title === tab.title) {
                return {
                    'active': true
                }
            }
            return {
                'active': false
            }
        }

        $scope.changeLocation = function(url, forceReload) {
            url = commonService.removeEndingSlash(url)
            console.log("Changing location to " + url +
                ", force: " + forceReload)
            $scope = $scope || angular.element(document).scope();
            if (forceReload || $scope.$$phase) {
                window.location = url;
            } else {
                //only use this if you want to replace the history stack
                //$location.path(url).replace();

                //this this if you want to change the URL and add it to the history stack
                loc.path(url);
                $scope.$apply();
            }
        }

        $scope.displayError = function() {
            var ModalInstanceCtrl = function($scope,
                $uibModalInstance) {
                $scope.dismiss = function() {
                    $uibModalInstance.dismiss(
                        'cancel');
                };
            };

            var modalHtml = '<div class="modal-body">' +
                err +
                '</div>';
            modalHtml +=
                '<div class="modal-footer"><button class="btn btn-primary" ng-click="dismiss()">DISMISS</button></div>';

            var modalInstance = $uibModal.open({
                template: modalHtml,
                controller: ModalInstanceCtrl
            });

            modalInstance.result.then(function() {},
                function() {
                    //Modal dismissed
                });
        }

        // This is what happens when an old school
        // C programmer writes angulerJS.
        //
        // int main(int argc, char **argv);
        $scope.uiUrl = $scope.itemMethods.getUiUrl();
        $scope.apiUrl = $scope.itemMethods.getApiUrl();
        $scope.itemName = $scope.itemMethods.getItemName();
        $scope.title = $scope.itemMethods.getTitle();
    })
    .directive('ngReallyClick', ['$uibModal',
        function($uibModal) {

            var ModalInstanceCtrl = function($scope,
                $uibModalInstance) {
                $scope.ok = function() {
                    $uibModalInstance.close();
                };

                $scope.cancel = function() {
                    $uibModalInstance.dismiss('cancel');
                };
            };

            return {
                restrict: 'A',
                scope: {
                    ngReallyClick: "&",
                    item: "="
                },
                link: function(scope, element, attrs) {
                    element.bind('click', function() {
                        var message = attrs.ngReallyMessage ||
                            "Are you sure?";

                        var modalHtml =
                            '<div class="modal-body">' +
                            message + '</div>';
                        modalHtml +=
                            '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button><button class="btn btn-warning" ng-click="cancel()">Cancel</button></div>';

                        var modalInstance = $uibModal.open({
                            template: modalHtml,
                            controller: ModalInstanceCtrl
                        });

                        modalInstance.result.then(
                            function() {
                                scope.ngReallyClick({
                                    item: scope
                                        .item
                                }); //raise an error : $digest already in progress
                            },
                            function() {
                                //Modal dismissed
                            });
                        //*/

                    });

                }
            }
        }
    ])
    .directive('csSelect', function() {
        return {
            require: '^stTable',
            template: '<input type="checkbox"/>',
            scope: {
                row: '=csSelect'
            },
            link: function(scope, element, attr, ctrl) {

                element.bind('change', function(evt) {
                    scope.$apply(function() {
                        ctrl.select(scope.row,
                            'multiple');
                    });
                });

                scope.$watch('row.isSelected', function(newValue,
                    oldValue) {
                    if (newValue === true) {
                        element.parent().addClass(
                            'st-selected');
                    } else {
                        element.parent().removeClass(
                            'st-selected');
                    }
                });
            }
        };
    });
