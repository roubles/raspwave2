var express = require('express');
var router = express.Router();

router.route('/')
    .get(function(req, res) {
        res.sendfile('views/logs.html')
    });
router.route('/create')
    .get(function(req, res) {
        res.sendfile('views/logcreate.html')
    });
router.route('/edit')
    .get(function(req, res) {
        res.sendfile('views/logedit.html')
    });

module.exports = router;
