const mongoose = require('mongoose')

const heroschema = new mongoose.Schema({

    subtitle: {
        type: String,
        required: [true, "subtitle is required"]
    },

    name: {
        type: String,
        required: [true, "name is required"]
    },

    description: {
        type: String,
        required: [true, "description is required"]
    },

    profileimage: {
        type: String,
        required: [true, "profileimage is required"]
    },

    public_id: {
        type: String,
    },

    resumelink: {
        type: String
    },

    github: {
        type: String,
        required: [true, "guthub is required"]
    },

    linkedin: {
        type: String,
        required: [true, "linkedin is required"]
    },

    instagram: {
        type: String,
        required: [true, "instagram is required"]
    },

    frontendtitle: {
        type: String,
        required: [true, "frontendtitle is required"]
    },

    backenedtitle: {
        type: String,
        required: [true, "backenedtitle is required"]
    },
}, { timestamps: true });

module.exports = mongoose.model('hero', heroschema)