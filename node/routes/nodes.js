var Node     = require('../models/node');
var express = require('express');
var router = express.Router();

router.route('/')
    .post(function(req, res) {
        var nodeId = req.body.nodeId;
        Node.create({nodeId:nodeId}, function(err, nodes) {
            if (err)
                res.send(err);

            res.redirect("ui/nodes");
        });
    })
    .get(function(req, res) {
        Node.find(function(err, nodes) {
            if (err)
                res.send(err);

            res.json(nodes);
        });
    });

module.exports = router;
