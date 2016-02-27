var User     = require('../models/user');
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "myapp"});

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json())
router.route('/')
    .post(function(req, res) {
        log.info("Creating user: " + req.body)
        log.info("Creating user: " + req.body.username)
        User.create({email: req.body.username}, function(err, users) {
            if (err)
                res.send(err);

            res.redirect("/users");
        });
    })
    .get(function(req, res) {
        log.info("Getting all users")
        User.find(function(err, users) {
            if (err)
                res.send(err);

            res.json(users);
        });
    });

module.exports = router;
