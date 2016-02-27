var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    email: String,
    password: String,
    firstname: String,
    lastname: String,
    middleinitial: String
});

module.exports = mongoose.model('User', UserSchema);
