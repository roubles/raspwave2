// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// REST ROUTES
var api = require('./api/allroutes');

// UI routes
var ui = require('./ui/allroutes');

var router = express.Router();
var mongoose   = require('mongoose');
mongoose.connect('localhost:27017/notificationsdb');

app.set('view engine', 'jade');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json())

var port = process.env.PORT || 8080;        // set our port

// REGISTER OUR ROUTES -------------------------------
app.use(function(req,res,next){
    req.mongoose = mongoose;
    next();
});

app.use(function(req, res, next) {
    if (req.path.substr(-1) == '/' && req.path.length > 1) {
        var query = req.url.slice(req.path.length);
        res.redirect(301, req.path.slice(0, -1) + query);
    } else {
        next();
    }
});

app.use('/ui', ui);
app.use('/api', api);
app.use(express.static(__dirname));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
