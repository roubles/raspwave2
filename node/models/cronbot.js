var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CronbotSchema   = new Schema({
    name: { type: String, required: true },
    script: { type: String, required: true },
    description: { type: String, required: true },
    schedule : { type: String, required: true }
});

module.exports = mongoose.model('cronbots', CronbotSchema);
