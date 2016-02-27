var express = require('express');
var router = express.Router();

router.route('/')
    .get(function(req, res) {
        res.sendfile('views/cronbots.html')
    });
router.route('/create')
    .get(function(req, res) {
        res.sendfile('views/cronbotcreate.html')
    });
router.route('/edit')
    .get(function(req, res) {
        res.sendfile('views/cronbotedit.html')
    });

module.exports = router;
