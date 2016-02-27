var express = require('express');
var router = express.Router();

router.route('/')
    .get(function(req, res) {
        res.sendfile('views/notifications.html')
    });
router.route('/create')
    .get(function(req, res) {
        res.sendfile('views/notificationcreate.html')
    });
router.route('/:id')
    .get(function(req, res) {
        res.sendfile('views/notificationedit.html')
    });

module.exports = router;
