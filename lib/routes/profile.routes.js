const express = require('express');
const Router = express.Router;
const profileRouter = Router();

const User = require('../models/user.schema');
const Resume = require('../models/resume.schema');
const Profile = require('../models/profile.schema');

const token = require('../auth/token');
const ensureAuth = require('../auth/ensure-auth');
const ensureRole = require('../auth/ensure-role');

const bodyParser = require('body-parser');

profileRouter
    .get('/verify', ensureAuth, (req, res) => {
        res.send({ valid: true });
    })
    .post('/profile', bodyParser, ensureAuth, (req, res, next) => {
        
    })