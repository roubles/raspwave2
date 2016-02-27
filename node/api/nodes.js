var Node     = require('../models/node');
var express = require('express');
var router = express.Router();

router.route('/')
    .post(function(req, res) {
        var nodeId = req.body.nodeId
        Node.findOne({"nodeId":nodeId}, function(err, node) {
            if (node)
                res.send(nodeId + " already exists.", 400);
        });
        var node = new Node();
        node.nodeId = nodeId;
        node.name = req.body.name;
        node.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Node created!' });
        });
        
    })
    .get(function(req, res) {
        skip = req.query.skip?parseInt(req.query.skip):0
        limit = req.query.limit?parseInt(req.query.limit):5
        if (skip < 0) {
            res.send('Invalid skip value: ' + skip, 404);
        }
        if (limit > 10) {
            res.send('Max 10 items at a time. Invalid limit value: ' + limit, 404);
        }
        Node.find(null, null, { skip: skip, limit: limit }, 
        function(err, nodes) {
            if (err)
                res.send(err);

            res.json(nodes);
        });
    });

router.route('/:nodeId')
    .get(function(req, res) {
        var nodeId = req.params.nodeId;
        Node.findOne({"nodeId":nodeId}, function(err, node) {
            if (err)
                res.send(err);
            res.json(node);
        });
    })
    .put(function(req, res) {
        var paramsNodeId = req.params.nodeId;
        Node.findOne({"nodeId":paramsNodeId}, function(err, node) {
            if (!node)
                res.send(paramsNodeId + " does not exist.", 400);
            node.nodeId = req.body.nodeId; 
            node.name = req.body.name;
            node.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Node created!' });
            });
        });
    })
    .delete(function(req, res) {
        var nodeId = req.params.nodeId;
        Node.remove({"nodeId":nodeId}, function(err, node) {
            if (err)
                res.send(err);
            res.json(node);
        });
    });

module.exports = router;
