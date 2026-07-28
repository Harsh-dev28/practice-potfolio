const mongoose = require('mongoose');

const serviceschema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);


module.exports = mongoose.model("service", serviceschema);