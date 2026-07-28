const mongoose = require("mongoose");

const projectschema = new mongoose.Schema({

    title: {
        type: String,
        required: [true, "Project title is required"],
        trim: true
    },

    description: {
        type: String,
        required: [true, "Project description is required"],
        trim: true
    },

    image: {
        type: String,
        required: [true, "Project image is required"],
    },

    public_id: {
        type: String
    },

    livelink: {
        type: String,
        required: [true, "Project Link is required"],
        trim: true
    },

    githublink: {
        type: String,
        required: [true, "github Link is required"],
        trim: true
    },

    technologies: [{
        type: String,
        required: true,
    }]
}, { timestamps: true });


module.exports = mongoose.model("project", projectschema);