var Cronbot     = require('../models/cronbot');
var express = require('express');
var router = express.Router();

router.route('/')
    .post(function(req, res) {
        var cronbot = new Cronbot();
        cronbot.name = req.body.name;
        cronbot.description = req.body.description;
        cronbot.schedule = req.body.schedule;
        cronbot.script = req.body.script;
        cronbot.save(function(err) {
            if (err) {
                console.log("data: " + cronbot.state)
                console.log("data: " + cronbot.description)
                console.log("error: " + err)
                res.json(err, 400);
            }
            res.json({ message: '/ui/cronbots/' + cronbot._id }, 200);
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
        Cronbot.find(null, null, { skip: skip, limit: limit }, 
        function(err, cronbots) {
            if (err) {
                console.log("error: " + err)
                res.json(err, 400);
            }
            res.json(cronbots);
        });
    });

router.route('/:id')
    .get(function(req, res) {
        var id = req.params.id;
        Cronbot.findById(id, function(err, cronbot) {
            if (err) {
                console.log("error: " + err)
                res.json(err, 400);
            }
            res.json(cronbot);
        });
    })
    .put(function(req, res) {
        var id = req.params.id;
        Cronbot.findById(id, function(err, cronbot) {
            if (!cronbot)
                res.send(id + " does not exist.", 400);
            cronbot.name = req.body.name;
            cronbot.description = req.body.description;
            cronbot.schedule = req.body.schedule;
            cronbot.script = req.body.script;
            console.log("Saving cronbot" + cronbot)
            cronbot.save(function(err) {
                if (err) {
                    console.log("error: " + err)
                    res.json(err, 400);
                }
                res.json({ message: '/ui/cronbots/' + cronbot._id }, 200);
            });
        });
    })
    .delete(function(req, res) {
        var id = req.params.id;
        console.log("delete " + id)

        Cronbot.find({ "_id":id }).remove(function(err, cronbot) {
            if (err) {
                console.log("error: " + err)
                res.send(err, 400);
            }
            res.json({ message: 'Deleted ' + id }, 204);
        });
    });

module.exports = router;
