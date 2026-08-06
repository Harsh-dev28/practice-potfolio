const mongoose = require("mongoose");

const certificateschema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Certificate title is required"],
        trim: true
    },
    organization: {
        type: String,
        required: [true, "Issuing organization is required"],
        trim: true
    },
    issueDate: {
        type: String,
        trim: true
    },
    credentialUrl: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String
    },
    public_id: {
        type: String
    }
}, { timestamps: true });

certificateschema.index({ createdAt: -1 });

module.exports = mongoose.model("certificate", certificateschema);
