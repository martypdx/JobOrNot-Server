const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Resume = require('./resume.schema');

const schema = new Schema({
    skills: {
        type: [String],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    company: {
        type: String
    },
    likedResumes: {
        type: [Schema.Types.ObjectId],
        ref: 'Resume'
    },
    likedCompanies: {
        type: String
    },
    myCompany: {
        type: String  
    },
    myResume: {
        type: Schema.Types.ObjectId,
        ref: 'Resume'
    }
});

const Profile = mongoose.model('Profile', schema);
module.exports = Profile;
