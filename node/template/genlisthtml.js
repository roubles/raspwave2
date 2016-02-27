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

var genmid1 = function(model) {
    for (var index in model) {
        if (model.hasOwnProperty(index)) {
            var attr = model[index];
            if (attr.options.showlist == true) {
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
                fs.appendFileSync(outfile, "<th st-sort=\"" + attr.path + "\">" + capitalizeFirstLetter(attr.path) + "</th>")
            }
        }
    }
    fs.appendFileSync(outfile, mid2);
    for (var index in model) {
        if (model.hasOwnProperty(index)) {
            var attr = model[index];
            if (attr.options.showlist == true) {
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
                fs.appendFileSync(outfile, "<th><input st-search=\"" + attr.path + "\" /></th>")
            }
        }
    }

    fs.appendFileSync(outfile, mid3);
}

var genmid4 = function(model) {
    for (var index in model) {
        if (model.hasOwnProperty(index)) {
            var attr = model[index];
            if (attr.options.showlist == true) {
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
                fs.appendFileSync(outfile, "<td>{{item." + attr.path + "}} </td>")
            }
        }
    }
}

var up = multiline(function() {
    /*
<!-- index.html -->
<!doctype html>

<!-- ASSIGN OUR ANGULAR MODULE -->
<html>

<head>
    <!-- META -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- Optimize mobile viewport -->

    <title>Notifications</title>

    <style>
        html {
            height: 100%;
        }
        
        body {
            height: 100%;
            padding-top: 50px;
        }
        
        .disabled {
            cursor: not-allowed;
            opacity: .3;
        }
        
        .container {
            height: 100%;
        }
        
        .table-container {
            height: 50%;
            overflow: auto;
        }
        
        .table {
            height: 90%;
        }
        
        .table tr {
            width: 100%;
            height: 10px;
        }
    </style>

    <link href="//netdna.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet" />
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.9/angular.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.9/angular-messages.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.9/angular-route.js"></script>
    <script src="//lorenzofox3.github.io/smart-table-website/bower_components/angular-smart-table/dist/smart-table.js"></script>
    <script src="../js/ui-bootstrap-tpls-1.1.2.min.js"></script>
    <script src="../js/notificationservice.js"></script>
    <script src="../js/common.js"></script>
    <script src="../js/notifications.js"></script>
</head>

<body>
    <div class="container" ng-app="notifications" ng-controller="notificationsCtrl">
        <ul class="nav nav-tabs">
            <li role="presentation" ng-class="getTabClass(tab, title)" ng-repeat="tab in getTabs()" class="smooth_transition">
                <a ng-click="changeLocation(tab.url)" role="tab">{{tab.title}}</a>
            </li>
        </ul>
        <ol class="breadcrumb">
            <li class="active">{{title}}</li>
        </ol>

        <div class="table-container">
            <table st-table="displayedCollection" st-safe-src="items" class="table table-hover table-striped">
                <thead>
                    <tr>
                        <th></th>
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

var mid2 = multiline(function() {
    /*
                        <th></th>
                    </tr>
                    <tr>
                        <th></th>
                        */
});

var mid3 = multiline(function() {
 /*
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="height:15px;" ng-repeat="item in displayedCollection">
                        <td cs-select="row"></td>
    */
});

var bottom = multiline(function() {
    /*
                        <td>
                            <a ng-click="setItem(item)" class="glyphicon glyphicon glyphicon-edit btn btn-dngr" role="button"></a>
                            <a ng-really-message="Delete {{itemName}} {{item._id}}?" ng-really-click="deleteByItem(item)" class="glyphicon glyphicon-trash btn btn-dngr" role="button"></a>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <form ng-submit="search()">
                            <input type="text" ng-model="q" />
                        </form>
                </tfoot>
                </tr>
            </table>
        </div>
        <ul class="pagination">
            <li><a ng-click="getPage(1)" ng-class="{disabled: disablePrev()}">&laquo;</a></li>
            <li><a ng-click="prevPage()" ng-class="{disabled: disablePrev()}">&lsaquo;</a></li>
            <li ng-class="getPageClass(page)" ng-repeat="page in pages"> <a ng-click="getPage(page)">{{page}}</a></li>
            <li> <a ng-class="{disabled: maxDisplayed == maxPage}" ng-click="rightElipsis()">..</a></li>
            <li><a ng-click="nextPage()" ng-class="{disabled: disableNext()}">&rsaquo;</a></li>
            <li><a ng-click="getPage(maxPage)" ng-class="{disabled: disableNext()}">&raquo;</a></li>
            <li>
                <select ng-change="refresh()" ng-options="i.value as i.label for i in limits" ng-model="limit">
                <option></option>
            </select>
                <li>
        </ul>
        <br>
        <br>
        <a ng-click="changeLocation(uiUrl + 'create')" class="btn btn-info" role="button">Add {{itemName}}</a>
        <a ng-really-message="Delete selected {{title}}?" style="float: right;" ng-really-click="deleteSelected()" class="glyphicon glyphicon-trash btn btn-dngr" role="button"></a>
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

    var outfile = './template/views/' + model + 's.html'
    up = replaceAll(up, "Notification", capitalizeFirstLetter(model))
    up = replaceAll(up, "notification", model)
    fs.writeFileSync(outfile, up);

    genmid1(Widget.schema.paths)


    genmid4(Widget.schema.paths)

    bottom = replaceAll(bottom, "Notification", capitalizeFirstLetter(model))
    bottom = replaceAll(bottom, "notification", model)
    fs.appendFileSync(outfile, bottom);
    var cmd = "js-beautify -rf " + outfile;
    exec(cmd, function(error, stdout, stderr) {
        console.log(stdout)
    });
}
