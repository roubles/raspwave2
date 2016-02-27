var express = require('express');
var router = express.Router();

router.route('/')
    .get(function(req, res) {
        res.sendfile('views/robots.html')
    });
router.route('/create')
    .get(function(req, res) {
        res.sendfile('views/robotcreate.html')
    });
router.route('/edit')
    .get(function(req, res) {
        res.sendfile('views/robotedit.html')
    });

module.exports = router;
