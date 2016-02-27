var notifications = require('./notifications');
var users = require('./users');
var express = require('express');
var router = express.Router();

router.use("/users", users)
router.use("/notifications", notifications)
router.route("/")
    .get(function(req, res) {
        res.render("hello")
    });

module.exports = router;
