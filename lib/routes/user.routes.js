const express = require('express');
const Router = express.Router;
const userRouter = Router();

const User = require('../models/user.schema');

const token = require('../auth/token');
const ensureAuth = require('../auth/ensure-auth')();

const bodyParser = require('body-parser').json();

function hasUserNameAndPassword(req, res, next) {
    const user = req.body;   

    if(!user.username || !user.password) {
        return next({
            code: 400,
            error: 'Username and Password Must Be Provided'
        });
    }
    next();
}

userRouter  

    .post('/signup', bodyParser, hasUserNameAndPassword, (req, res, next) => {
        let data = req.body;
        let userObj = {};
        User.find({ username: data.username }).count()
            .then(count => {
                if(count > 0) throw {
                    code: 400,
                    error: `Username ${data.username} already exists`
                };
                return new User(data).save();
            })
            .then(user => {
                userObj = user;
                return token.sign(user);
            })
            .then(token => {
                res.send({ userObj, token });
            })
            .catch(next);
    })

    .post('/signin', bodyParser, hasUserNameAndPassword, (req, res, next) => {
        const data = req.body;
        let userObj = {};

        User.findOne({ username: data.username })
            .then(user => {
                if(!user || !user.comparePassword(data.password)) {
                    throw {
                        code: 400,
                        error: 'invalid username or password'
                    };
                }
                return user;
            })
            .then(user => {
                userObj = user;
                return token.sign(user);
            })
            .then(token => {
                res.send({ userObj, token });
            })
            .catch(next);
    })

    // still live! https://job-or-not.herokuapp.com/profile
    .get('/profile', (req, res, next) => { //THIS IS FOR DEV ONLY -- DELETE BEFORE DEPLOY
        return User.find()
            .then(users => {
                res.send(users);
            })
            .catch(next);
    })

    .get('/profile/:id', ensureAuth, (req, res, next) => { 
        User.findById({ _id: req.params.id })
            .populate('likedResumes', 'file')
            .populate('myResume')
            .lean()
            .then(user => {
                if(!user){
                    res.status(404).send({ error: 'Cannot Find User Profile' });
                } else res.send(user); //DO NOT SEND BACK HASH
            })
            .catch(next);
    })
    
    // route should be the name of the resource, not an action or description of action
    // .patch('/profile', ...)
    .patch('/changeAccountInfo', ensureAuth, bodyParser, (req, res, next) => { 
        const payload = {};

        // Don't repeat multi-property access
        const profile = req.body;

        if(profile.firstName) {payload.firstName = profile.firstName;}

        if(profile.lastName) {payload.lastName = profile.lastName;}

        if(profile.email) {payload.email = profile.email;}

        if(profile.company) {payload.company = profile.company;}

        if(profile.jobTitleToFill) {payload.$push = {jobTitleToFill: profile.jobTitleToFill};}

        if(profile.jobCompanyToFill) {payload.$push = {jobCompanyToFill: profile.jobCompanyToFill};}

        if(profile.likedCompanies) {payload.$push = {likedCompanies: profile.likedCompanies};}

        if(profile.myCompany) {payload.myCompany = profile.myCompany;}

        return User.findByIdAndUpdate(req.user.id, payload, {new: true})
            .then(user => {
                if(profile.password) user.password = profile.password;
                user.save();
                return user;
            })
            .then(user => res.send(user))
            .catch(next);
    })

    .delete('/deleteAccount', ensureAuth, bodyParser, (req, res, next) => {
        User.findByIdAndRemove(req.user.id)
            .then( () => res.send({ message: 'Your user account has been deleted!' }))
            .catch(next);
    });

module.exports = userRouter;