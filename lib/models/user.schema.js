const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Profile = require('./profile.schema');

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
    profile: {
        type: Schema.Types.ObjectId,
        ref: 'Profile'
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