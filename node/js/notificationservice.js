angular.module('notificationServiceProvider', [])
    .factory('notificationService', function() {
        var uiUrl = '/ui/notifications/';
        var apiUrl = '/api/notifications/';
        var itemName = 'Notification';
        var title = 'Notifications';
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
