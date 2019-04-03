const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Company = new Schema({
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        address: {
            type:  String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        imgUrl: {
            type: String
        },
        identification: {
            type: Number,
            required: true
        },
        jobs: [{
            type: Schema.Types.ObjectId,
            ref: 'Job'
        }]
});


module.exports = mongoose.model('Company', Company);