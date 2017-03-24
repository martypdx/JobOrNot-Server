const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    resumeImage: {
        data: Buffer,
        contentType: String,
        required: true
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