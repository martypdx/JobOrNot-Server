const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Resume = require('./resume.schema');

const bcrypt = require('bcryptjs');


const schema = new Schema({
    username: {
        type: String, 
        required: true
    },
    hash: { 
        type: String, 
        required: true 
    },
    roles: {
        type: String,
        enum: ['recruiter', 'jobseeker']
    },
    email: {
        type: String,
        required: true
    },
    skills: {
        type: [String]
    },
    location: {
        type: String
    },
    name: {
        type: String
        //required: true
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

schema.virtual('password').set(function(password){
    this.hash = bcrypt.hashSync(password, 8);
});

schema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.hash);
};

const User = mongoose.model('User', schema);
module.exports = User;
