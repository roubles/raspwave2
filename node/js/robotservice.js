angular.module('robotServiceProvider', [])
    .factory('robotService', function() {
        var uiUrl = '/ui/robots/';
        var apiUrl = '/api/robots/';
        var itemName = 'Robot';
        var title = 'Robots';
        return {
            getUiUrl: function() {
                return uiUrl;
            },
            getApiUrl: function() {
                return apiUrl;
            },
            getItemName: function() {
                return itemName;
            },
            getTitle: function() {
                return title;
            },
        };
    });