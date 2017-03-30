const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcryptjs');


const schema = new Schema({
    username: {
        type: String, 
        required: true
    },
    hash: { 
        type: String, 
        required: true,
        // set(password) {
        //     return bcrypt.hashSync(password, 8);
        // } something to consider 
    },
    role: {
        type: String,
        enum: ['recruiter', 'talent']
    },
    email: {
        type: String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    company: {
        type: String
    },
    jobTitleToFill: [
        {
            type: String
        }
    ],
    jobCompanyToFill: [
        {
            type: String // TODO : Needs own schema or make above an object
        }
    ],
    likedResumes: [
        {
            type: [Schema.Types.ObjectId],
            ref: 'Resume'
        }
    ],
    likedCompanies: [
        {
            type: String
        }
    ],
    myCompany: {
        type: String  
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
