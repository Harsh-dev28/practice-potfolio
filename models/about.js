const mongoose = require('mongoose')

const aboutSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    skills: [
        {
            type: String
        }
    ],

    achievements: [
        {
            type: String
        }
    ]

}, { timestamps: true })

module.exports = mongoose.model('About', aboutSchema)