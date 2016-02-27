var models = require('../models/models')
var express = require('express');
var router = express.Router();

for (var i = 0; i < models.length; i++) {
    model = models[i];
    console.log('Working on model: ' + model)
    var widget = require('../models/' + model);
    var Widget = widget.model;
    var sort = widget.sort;
    console.log('Adding api route for /api/' + model + 's/')
    router.route('/' + model + 's')
        .post(function(req, res) {
            console.log('POST ' + req.originalUrl)
            var widget = new Widget(req.body.data);
            console.log("Creating widget " + widget)
            widget.save(function(err) {
                if (err) {
                    console.log("error: " + err)
                    res.json(err, 400);
                }

                res.json({
                    message: 'Widget created!'
                });
            });

        })
        .get(function(req, res) {
            console.log('GET ' + req.originalUrl)
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
                        if (err) {
                            console.log("error: " + err)
                            res.json(err, 400);
                        }
                        Widget.count({
                                $text: {
                                    $search: q
                                }
                            },
                            function(err, count) {
                                if (err) {
                                    console.log("error: " + err)
                                    res.json(err, 400);
                                }
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
                    if (err) {
                        console.log("error: " + err)
                        res.json(err, 400);
                    }
                    Widget.count(null,
                        function(err, count) {
                            if (err) {
                                console.log("error: " + err)
                                res.json(err, 400);
                            }
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
    console.log('Adding api route for /api/' + model + 's/:id')
    router.route('/' + model + 's/:id')
        .get(function(req, res) {
            console.log('GET ' + req.originalUrl)
            var id = req.params.id;
            Widget.findById(id, function(err, widget) {
                if (err) {
                    console.log("error: " + err)
                    res.json(err, 400);
                }
                res.json({
                    data: widget
                });
            });
        })
        .put(function(req, res) {
            console.log('PUT ' + req.originalUrl)
            var id = req.params.id;
            delete req.body.data._id;
            Widget.update({
                _id: id
            }, req.body.data, function(err, num) {
                if (err) {
                    console.log("error: " + err)
                    res.json(err, 400);
                }
                console.log("Updated widget with id " + id +
                    " with " + JSON.stringify(
                        req.body.data, null, 4))
                res.json({
                    message: '/ui/widgets/' + id
                }, 200);
            });
        })
        .delete(function(req, res) {
            console.log('DELETE ' + req.originalUrl)
            var id = req.params.id;
            Widget.find({
                "_id": id
            }).remove(function(err, widget) {
                if (err) {
                    console.log("error: " + err)
                    res.json(err, 400);
                }
                console.log("Deleting widget " + id)
                res.send('Deleted ' + id, 204);
            });
        });
}

module.exports = router
