var Notification     = require('../models/notification');
var express = require('express');
var router = express.Router();

router.route('/')
    .post(function(req, res) {
        var queue = req.body.queue;
        var nid = req.body.nid;
        Notification.create({queue: queue, nid:nid}, function(err, notifications) {
            if (err)
                res.send(err);

            res.redirect("ui/notifications");
        });
    })
    .get(function(req, res) {
        Notification.find(function(err, notifications) {
            if (err)
                res.send(err);

            res.json(notifications);
        });
    });

module.exports = router;
