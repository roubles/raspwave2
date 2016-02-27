var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var LogSchema   = new Schema({
    date: { type: Date, default: Date.now },
    level: {type: String, required: true, enum: ['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE']},
    message: { type: String, default: "" },
    transaction: String,
});

module.exports = mongoose.model('logs', LogSchema);
