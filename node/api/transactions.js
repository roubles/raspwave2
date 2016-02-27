var Transaction     = require('../models/transaction');
var express = require('express');
var router = express.Router();

router.route('/')
    .post(function(req, res) {
        var transaction = new Transaction();
        transaction.state = req.body.state;
        transaction.description = req.body.description;
        transaction.save(function(err) {
            if (err) {
                console.log("data: " + transaction.state)
                console.log("data: " + transaction.description)
                console.log("error: " + err)
                res.json(err, 400);
            }
            res.json({ message: '/ui/transactions/' + transaction._id }, 200);
        });
    })
    .get(function(req, res) {
        skip = req.query.skip?parseInt(req.query.skip):0
        limit = req.query.limit?parseInt(req.query.limit):5
        if (skip < 0) {
            res.send('Invalid skip value: ' + skip, 404);
        }
        if (limit > 10) {
            res.send('Max 10 items at a time. Invalid limit value: ' + limit, 404);
        }
        Transaction.find(null, null, { skip: skip, limit: limit }, 
        function(err, transactions) {
            if (err) {
                console.log("error: " + err)
                res.json(err, 400);
            }
            res.json(transactions);
        });
    });

router.route('/:id')
    .get(function(req, res) {
        var id = req.params.id;
        Transaction.findById(id, function(err, transaction) {
            if (err) {
                console.log("error: " + err)
                res.json(err, 400);
            }
            res.json(transaction);
        });
    })
    .put(function(req, res) {
        var id = req.params.id;
        Transaction.findById(id, function(err, transaction) {
            if (!transaction)
                res.send(id + " does not exist.", 400);
            transaction.started_time = req.body.started_time;
            transaction.completed_time = req.body.completed_time;
            transaction.state = req.body.state;
            transaction.parent = req.body.parent;
            transaction.description = req.body.description;
            console.log("Saving trans" + transaction)
            transaction.save(function(err) {
                if (err) {
                    console.log("error: " + err)
                    res.json(err, 400);
                }
                res.json({ message: '/ui/transactions/' + transaction._id }, 200);
            });
        });
    })
    .delete(function(req, res) {
        var id = req.params.id;
        console.log("delete " + id)

        Transaction.find({ "_id":id }).remove(function(err, transaction) {
            if (err) {
                console.log("error: " + err)
                res.send(err, 400);
            }
            res.json({ message: 'Deleted ' + id }, 204);
        });
    });

module.exports = router;
