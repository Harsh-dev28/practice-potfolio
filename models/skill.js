const mongoose = require('mongoose')

const skillschema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    percentage: {
        type: String,
        required: true
    },

    icon: {
        type: String,
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model("skill", skillschema)