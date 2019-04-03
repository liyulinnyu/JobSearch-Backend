const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    skills: [{
        type: String
    }],
    desire: [{
        type: String
    }],
    identification: {
        type: Number,
        required: true
    },
    jobs: [{
        type: Schema.Types.ObjectId,
        ref: 'Job'
    }]
});

module.exports = mongoose.model('User', User);