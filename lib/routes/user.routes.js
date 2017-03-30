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
        console.log('I MADE IT TO SIGNUP!!!');
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
            .then(user => {
                if(!user){
                    res.status(404).send({ error: 'Cannot Find User Profile' });
                } else res.send(user); //DO NOT SEND BACK HASH
            })
            .catch(next);
    })
    
    .patch('/changeAccountInfo', ensureAuth, bodyParser, (req, res, next) => { 
        const payload = {};

        if(req.body.firstName) {payload.firstName = req.body.firstName;}

        if(req.body.lastName) {payload.lastName = req.body.lastName;}

        if(req.body.email) {payload.email = req.body.email;}

        if(req.body.company) {payload.company = req.body.company;}

        if(req.body.jobTitleToFill) {payload.$push = {jobTitleToFill: req.body.jobTitleToFill};}

        if(req.body.jobCompanyToFill) {payload.$push = {jobCompanyToFill: req.body.jobCompanyToFill};}

        if(req.body.likedCompanies) {payload.$push = {likedCompanies: req.body.likedCompanies};}

        if(req.body.myCompany) {payload.myCompany = req.body.myCompany;}

        return User.findByIdAndUpdate(req.user.id, payload, {new: true})
            .then(user => {
                if(req.body.password) user.password = req.body.password;
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