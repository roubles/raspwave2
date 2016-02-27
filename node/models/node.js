var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var NodeSchema   = new Schema({
    nodeId: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    batteryValue: {type: String, default: "--"},
    lastWakeupTime: {type: String, default: "--"},
    value: {type: String, default: "--"},
    wakeupInterval: String
});

module.exports = mongoose.model('nodes', NodeSchema);
