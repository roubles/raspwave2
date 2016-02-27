var Robot     = require('../models/robot');
var express = require('express');
var router = express.Router();

router.route('/')
    .post(function(req, res) {
        var robot = new Robot();
        robot.name = req.body.name;
        robot.description = req.body.description;
        robot.subscriptions = req.body.subscriptions;
        robot.script = req.body.script;
            console.log("Saving robot" + robot)
        robot.save(function(err) {
            if (err) {
                console.log("data: " + robot.state)
                console.log("data: " + robot.description)
                console.log("error: " + err)
                res.json(err, 400);
            }
            res.json({ message: '/ui/robots/' + robot._id }, 200);
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
        Robot.find(null, null, { skip: skip, limit: limit }, 
        function(err, robots) {
            if (err) {
                console.log("error: " + err)
                res.json(err, 400);
            }
            res.json(robots);
        });
    });

router.route('/:id')
    .get(function(req, res) {
        var id = req.params.id;
        Robot.findById(id, function(err, robot) {
            if (err) {
                console.log("error: " + err)
                res.json(err, 400);
            }
            res.json(robot);
        });
    })
    .put(function(req, res) {
        var id = req.params.id;
        Robot.findById(id, function(err, robot) {
            if (!robot)
                res.send(id + " does not exist.", 400);
            robot.name = req.body.name;
            robot.description = req.body.description;
            robot.subscriptions = req.body.subscriptions;
            robot.script = req.body.script;
            console.log("Saving robot" + robot)
            robot.save(function(err) {
                if (err) {
                    console.log("error: " + err)
                    res.json(err, 400);
                }
                res.json({ message: '/ui/robots/' + robot._id }, 200);
            });
        });
    })
    .delete(function(req, res) {
        var id = req.params.id;
        console.log("delete " + id)

        Robot.find({ "_id":id }).remove(function(err, robot) {
            if (err) {
                console.log("error: " + err)
                res.send(err, 400);
            }
            res.json({ message: 'Deleted ' + id }, 204);
        });
    });

module.exports = router;
