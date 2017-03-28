const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    file: {
        type: Buffer,
        contentType: String
    },
    name: {
        type: String
    },
    timesViewed: {
        type: Number
    },
    timesLiked: {
        type: Number
    },
    likedBy: {
        type: [String]
    }
});

const Resume = mongoose.model('Resume', schema);
module.exports = Resume;