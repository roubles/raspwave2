var models = require('../models/models')
var express = require('express');
var router = express.Router();

for (var i = 0; i < models.length; i++) {
    model = models[i];
    console.log('Working on model: ' + model)
    console.log('Adding ui route for /ui/' + model + 's/')
    router.route('/' + model + 's')
        .get(function(req, res) {
            res.sendfile('views/' + model + 's.html')
        });
    console.log('Adding ui route for /ui/' + model + '/create')
    router.route('/' + model + 's/create')
        .get(function(req, res) {
            res.sendfile('views/' + model + 'create.html')
        });
    console.log('Adding ui route for /ui/' + model + '/:id')
    router.route('/' + model + 's/:id')
        .get(function(req, res) {
            res.sendfile('views/' + model + 'edit.html')
        });
}

module.exports = router
