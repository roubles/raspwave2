var multiline = require('multiline')
var models = require('../models/models')
var express = require('express');
var router = express.Router();
var fs = require('fs')
var exec = require('child_process').exec;

var capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var replaceAll = function(s, needle, haystack) {
    return s.replace(new RegExp(needle, 'g'), haystack);
};

var js = multiline(function() {
    /*
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
    */
});

for (var i = 0; i < models.length; i++) {
    model = models[i];
    console.log('Working on model: ' + model)

    js = replaceAll(js, "Notification", capitalizeFirstLetter(model))
    js = replaceAll(js, "notification", model)
    fs.writeFileSync('./template/js/' + model + 'service.js', js);
    var cmd = "js-beautify -rf ./template/js/" + model + "service.js";
    exec(cmd, function(error, stdout, stderr) {
        console.log(stdout)
    });
}
