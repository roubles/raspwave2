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
}

var genmid = function(model) {
    for (var index in model) {
        if (model.hasOwnProperty(index)) {
            var attr = model[index];
            if (attr.options.showcreate == true) {
                var instance = attr.instance;
                var required = attr.options.required ? "required" :
                    ""
                var maxlength = attr.options.maxlength ? parseInt(attr.options
                    .maxlength) : 0
                var minlength = attr.options.minlength ? parseInt(attr.options
                    .minlength) : 0
                var placeholder = attr.options.placeholder ? attr.options
                    .placeholder : attr.path
                console.log("Attribute: " + attr.path)
                console.log("    instance: " + instance)
                console.log("    required: " + required)
                console.log("    maxlength: " + maxlength)
                console.log("    minlength: " + minlength)
                console.log("    placeholder: " + placeholder)
                    //console.log(JSON.stringify(attr, null, 4))
                if (instance === "String") {
                    mid = replaceAll(string, "Blob", capitalizeFirstLetter(attr.path))
                    mid = replaceAll(mid, "blob", attr.path)
                    mid = replaceAll(mid, "__REQ__", required)
                    mid = replaceAll(mid, "__NGMAX__", maxlength)
                    mid = replaceAll(mid, "__NGMIN__", minlength)
                    mid = replaceAll(mid, "__PLACE__", placeholder)
                    fs.appendFileSync(outfile, mid);
                }
            }
        }
    }
}

var up = multiline(function() {
    /*
<!doctype html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Notification Create</title>

    <style>
        body {
            padding-top: 50px;
        }
    </style>

    <link href="//netdna.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet" />
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.9/angular.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.9/angular-messages.js"></script>
    <script src="../../js/ui-bootstrap-tpls-1.1.2.min.js"></script>
    <script src="../../js/notificationservice.js"></script>
    <script src="../../js/common.js"></script>
    <script src="../../js/notificationcreate.js"></script>
</head>

<body>
    <div class="container" ng-app="notifications" ng-controller="notificationCreateCtrl">
        <ul class="nav nav-tabs">
            <li role="presentation" ng-class="getTabClass(tab, title)" ng-repeat="tab in getTabs()" class="smooth_transition">
                <a ng-click="changeLocation(tab.url)" role="tab">{{tab.title}}</a>
            </li>
        </ul>
        <ol class="breadcrumb">
            <li><a ng-click="changeLocation(uiUrl)" role="button">{{title}}</a></li>
            <li class="active">Create</li>
        </ol>

        <form class="form-horizontal" name="createform" novalidate ng-submit="createform.$valid && create()">
    */
});

var string = multiline(function() {
    /*
<div class="form-group">
    <label class="control-label col-xs-2" for="name">Blob</label>
    <div class="col-xs-4">
        <input class="form-control" type="text" ng-model="item.blob" id="blob" name="blob" __REQ__ ng-maxlength="__NGMAX__" ng-minlength="__NGMIN__" placeholder="__PLACE__" />
    </div>
    <div class="col-xs-4" ng-messages="createform.blob.$error" ng-show="createform.blob.$touched">
        <div ng-messages-include="../../views/messages.html"></div>
    </div>
</div>
    */
});

var bottom = multiline(function() {
    /*
            <div class="form-group">
                <div class="col-xs-4">
                    <a ng-click="changeLocation(uiUrl)" class="glyphicon glyphicon-arrow-left btn btn-info" role="button"></a>
                    <button class="btn btn-info" type="submit" ng-disabled="createform.$invalid">Add</button>
                </div>
            </div>
        </form>
    </div>
</body>

</html>
    */
});


for (var i = 0; i < models.length; i++) {
    model = models[i];
    var widget = require('../models/' + model);
    var Widget = widget.model;
    var sort = widget.sort;
    console.log("sort: " + sort)
    console.log('Working on model: ' + model)

    var outfile = './template/views/' + model + 'create.html'
    up = replaceAll(up, "Notification", model)
    up = replaceAll(up, "notification", model)
    fs.writeFileSync(outfile, up);

    genmid(Widget.schema.paths)

    bottom = replaceAll(bottom, "notification", model)
    fs.appendFileSync(outfile, bottom);
    var cmd = "js-beautify -rf ./template/views/" + model + "create.html";
    exec(cmd, function(error, stdout, stderr) {
        console.log(stdout)
    });
}
