var Notification     = require('../models/notification');
var express = require('express');
var router = express.Router();

router.route('/notifications')
    .get(function(req, res) {
        Notification.find(function(err, notifications) {
            if (err)
                res.send(err);

            res.render('notifications', {notifications:notifications})
        });
    });
router.route('/notification/create')
    .get(function(req, res) {
        res.render('notificationcreate')
    });

module.exports = router;
