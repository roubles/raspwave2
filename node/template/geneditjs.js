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
    .controller('notificationEditCtrl', function($scope, $controller, $http,
        $location, $window, $uibModal, commonService,
        notificationService) {
        // Implement abstract methods
        $scope.itemMethods = notificationService

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
    */
});

for (var i = 0; i < models.length; i++) {
    model = models[i];
    console.log('Working on model: ' + model)

    js = replaceAll(js, "notification", model)
    fs.writeFileSync('./template/js/' + model + 'edit.js', js);
    var cmd = "js-beautify -rf ./template/js/" + model + "edit.js";
    exec(cmd, function(error, stdout, stderr) {
        console.log(stdout)
    });
}
