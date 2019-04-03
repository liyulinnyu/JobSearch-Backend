const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Job = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requirement: [{
        type: String
    }],
    date: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    applicants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});


module.exports = mongoose.model('Job', Job);