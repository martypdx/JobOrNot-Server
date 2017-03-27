const express = require('express');
const Router = express.Router;
const userRouter = Router();

const User = require('../models/user.schema');
const Resume = require('../models/resume.schema');

const token = require('../auth/token');
const ensureAuth = require('../auth/ensure-auth')();
const ensureRole = require('../auth/ensure-role')();

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
        User.find({ username: data.username }).count()
            .then(count => {
                if(count > 0) throw {
                    code: 400,
                    error: `Username ${data.username} already exists`
                };
                return new User(data).save();
            })
            .then(user => token.sign(user))
            .then(token => res.send({ token }))
            .catch(next);
    })

    .post('/signin', bodyParser, hasUserNameAndPassword, (req, res, next) => {
        const data = req.body;

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
            .then(user => token.sign(user))
            .then(token => res.send({ token }))
            .catch(next);
    })

    .get('/profile', (req, res, next) => {
        return User.find()
            .then(users => {
                res.send(users);
            })
            .catch(next);
    })

    .get('/profile/:id', ensureAuth, (req, res, next) => {
        User.findById({ _id: req.params.id })
            .populate('likedResumes')
            .populate('myResume')
            .then(user => {
                if(!user){
                    res.status(404).send({ error: 'Cannot Find User Profile' });
                } else res.send(user);
            })
            .catch(next);
    })
    
    .patch('/changeAccountInfo', ensureAuth, bodyParser, (req, res, next) => {
        return User.findByIdAndUpdate(req.user.id, req.body, {new: true})
            .then(user => res.send(user))
            .catch(next);
    })

    .delete('/deleteAccount', ensureAuth, bodyParser, (req, res, next) => {
        User.findByIdAndRemove(req.user.id)
            .then( () => res.send({ message: 'Your user account has been deleted!' }))
            .catch(next);
    });

module.exports = userRouter;