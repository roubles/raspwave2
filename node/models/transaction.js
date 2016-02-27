var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TransactionSchema   = new Schema({
    submitted_time: { type: Date, default: Date.now },
    started_time: { type: Date },
    completed_time: { type: Date },
    state: {type: String, default: "READY", enum: ['READY', 'RUNNING', 'SUCCESS', 'FAILED']},
    description: { type: String, required: true },
    parent: String,
});

module.exports = mongoose.model('transactions', TransactionSchema);
