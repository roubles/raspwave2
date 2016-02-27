var Log     = require('../models/log');
var express = require('express');
var router = express.Router();

router.route('/')
    .post(function(req, res) {
        var log = new Log();
        console.log("m=" + req.body.message)
        log.level = req.body.level;
        log.message = req.body.message;
        log.transaction = req.body.transaction;
        console.log("creating log" + log)
        log.save(function(err) {
            if (err) {
                console.log("error: " + err)
                res.json(err, 400);
            }
            res.json({ message: '/ui/logs/' + log._id }, 200);
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
        Log.find(null, null, { skip: skip, limit: limit }, 
        function(err, logs) {
            if (err) {
                console.log("error: " + err)
                res.json(err, 400);
            }
            res.json(logs);
        });
    });

router.route('/:id')
    .get(function(req, res) {
        var id = req.params.id;
        Log.findById(id, function(err, log) {
            if (err) {
                console.log("error: " + err)
                res.json(err, 400);
            }
            res.json(log);
        });
    })
    .delete(function(req, res) {
        var id = req.params.id;
        console.log("delete " + id)

        Log.find({ "_id":id }).remove(function(err, log) {
            if (err) {
                console.log("error: " + err)
                res.send(err, 400);
            }
            res.json({ message: 'Deleted ' + id }, 204);
        });
    });

module.exports = router;
