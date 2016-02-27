var models = require('../models/models')
var express = require('express');
var router = express.Router();

for (model in models) {
    var widget = require('../models/' + model);
    var Widget = widget.model;
    var sort = widget.sort;
    router.route('/' + model + '/')
        .post(function(req, res) {
            var notification = new Widget(req.body.data);
            console.log("Saving notification " + notification)
            notification.save(function(err) {
                if (err)
                    res.send(err);

                res.json({
                    message: 'Widget created!'
                });
            });

        })
        .get(function(req, res) {
            q = req.query.q ? req.query.q : null
            skip = req.query.skip ? parseInt(req.query.skip) : 0
            limit = req.query.limit ? parseInt(req.query.limit) : 5
            if (skip < 0) {
                res.send('Invalid skip value: ' + skip, 404);
            }
            if (limit > 200) {
                res.send(
                    'Max 200 items at a time. Invalid limit value: ' +
                    limit, 404);
            }
            var items = null;
            var count = 0;
            if (q) {
                Widget.find({
                        $text: {
                            $search: q
                        }
                    }, {
                        score: {
                            $meta: "textScore"
                        }
                    }, {
                        skip: skip,
                        limit: limit
                    })
                    .sort({
                        score: {
                            $meta: 'textScore'
                        }
                    })
                    .exec(function(err, results) {
                        if (err)
                            res.send(err);
                        Widget.count({
                                $text: {
                                    $search: q
                                }
                            },
                            function(err, count) {
                                if (err)
                                    res.send(err);
                                console.log(count)
                                res.json({
                                    data: results,
                                    meta: {
                                        count: count,
                                        skip: skip,
                                        limit: limit
                                    }
                                })
                            });
                    });
            } else {
                var query = Widget.find().sort(sort).skip(skip)
                    .limit(limit)
                query.exec(function(err, results) {
                    if (err)
                        res.send(err);
                    Widget.count(null,
                        function(err, count) {
                            if (err)
                                res.send(err);
                            res.json({
                                data: results,
                                meta: {
                                    count: count,
                                    skip: skip,
                                    limit: limit
                                }
                            })
                        });
                });
            }
        });
    router.route('/' + model + '/:id')
        .get(function(req, res) {
            var id = req.params.id;
            Widget.findById(id, function(err, notification) {
                if (err)
                    res.send(err);
                res.json({
                    data: notification
                });
            });
        })
        .put(function(req, res) {
            var id = req.params.id;
            delete req.body.data._id;
            Widget.update({
                _id: id
            }, req.body.data, function(err, num) {
                if (err) {
                    console.log("error: " + err)
                    res.json(err, 400);
                }
                res.json({
                    message: '/ui/notifications/' + id
                }, 200);
            });
        })
        .delete(function(req, res) {
            var id = req.params.id;
            console.log("delete " + id)

            Widget.find({
                "_id": id
            }).remove(function(err, notification) {
                if (err)
                    res.send(err);
                res.send('Deleted ' + id, 204);
            });
        });
}
module.exports = router
