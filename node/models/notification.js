var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var NotificationSchema = new Schema({
    date: {type: Date, default: Date.now, showcreate: true},
    type: {type: String, required: true},
    value: {type: String, required: false},
    blob: {type: String, required: false},
}, { timestamps: true });

// Text search index
NotificationSchema.index({ type: 'text', value: 'text', blob: 'text'});

module.exports = mongoose.model('notifications', NotificationSchema);
module.exports = {model:mongoose.model('notifications', NotificationSchema), sort:"-updatedAt"}
