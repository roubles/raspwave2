PORT = 8002;
HOST = '127.0.0.1';

var express    = require('express');        // call express
var app        = express();
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "myapp"});

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'localhost:8080');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}
app.use(allowCrossDomain);

// This is an example of serving static content from node
var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(PORT);
log.info("Running static web server on port: " + PORT);
