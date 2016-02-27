var express = require('express');
var router = express.Router();

router.route('/')
    .get(function(req, res) {
        res.sendfile('views/transactions.html')
    });
router.route('/create')
    .get(function(req, res) {
        res.sendfile('views/transactioncreate.html')
    });
router.route('/edit')
    .get(function(req, res) {
        res.sendfile('views/transactionedit.html')
    });

module.exports = router;
