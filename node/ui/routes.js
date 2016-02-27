var nodes = require('./nodes');
var notifications = require('./notifications');
var logs = require('./logs');
var transactions = require('./transactions');
var robots = require('./robots');
var cronbots = require('./cronbots');
var express = require('express');
var router = express.Router();

router.use("/nodes", nodes)
router.use("/notifications", notifications)
router.use("/logs", logs)
router.use("/transactions", transactions)
router.use("/robots", robots)
router.use("/cronbots", cronbots)

module.exports = router;
