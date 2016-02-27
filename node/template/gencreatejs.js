var multiline = require('multiline')
var models = require('../models/models')
var express = require('express');
var router = express.Router();
var fs = require('fs')
var exec = require('child_process').exec;

var replaceAll = function(s, needle, haystack) {
    return s.replace(new RegExp(needle, 'g'), haystack);
};

var js = multiline(function() {
    /*
angular.module('notifications', ['ui.bootstrap', 'common',
        'notificationServiceProvider'
    ])
    .config(['$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }])
    .controller('notificationCreateCtrl', function($scope, $controller,
        $http, $location, $window, commonService, notificationService) {

        // Implement abstract methods
        $scope.itemMethods = notificationService

        // Multiple inheritance in an non OO language
        $controller('commonCtrl', {
            $scope: $scope
        });

        $controller('commonAddCtrl', {
            $scope: $scope
        });
    });
    */
});

for (var i = 0; i < models.length; i++) {
    model = models[i];
    console.log('Working on model: ' + model)

    js = replaceAll(js, "notification", model)
    fs.writeFileSync('./template/js/' + model + 'create.js', js);
    var cmd = "js-beautify -rf ./template/js/" + model + "create.js";
    exec(cmd, function(error, stdout, stderr) {
        console.log(stdout)
    });
}
