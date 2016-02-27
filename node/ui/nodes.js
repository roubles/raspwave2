var express = require('express');
var router = express.Router();

router.route('/')
    .get(function(req, res) {
        res.sendfile('views/nodes.html')
    });
router.route('/create')
    .get(function(req, res) {
        res.sendfile('views/nodecreate.html')
    });
router.route('/edit')
    .get(function(req, res) {
        res.sendfile('views/nodeedit.html')
    });

module.exports = router;
