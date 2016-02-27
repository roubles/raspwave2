var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RobotSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength: 255,
        showcreate: true,
        showlist: true
    },
    subscriptions: {
        type: String,
        maxlength: 255,
        showcreate: true,
        showlist: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 255,
        showcreate: true,
        showlist: true
    },
    script: {
        type: String,
        required: true,
        showcreate: true,
        maxlength: 10000,
    },
    app: {
        type: String,
        showcreate: true,
        maxlength: 255,
        placeholder: 'application related to this robot',
    },
}, {
    timestamps: true
});

module.exports = {
    model: mongoose.model('robots', RobotSchema),
    sort: "-updatedAt"
}
