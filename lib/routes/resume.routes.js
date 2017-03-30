const router = require('express').Router();
const Resume = require('../models/resume.schema');
const User = require('../models/user.schema');
const multer = require('multer');
const fs = require('fs');

const token = require('../auth/token');
const ensureAuth = require('../auth/ensure-auth')();
const ensureRole = require('../auth/ensure-role')();

const bodyParser = require('body-parser').json();

const storage = multer.diskStorage({
    destination: './tmp',
    filename(req, file, cb) {
        console.log('file: ', file);
        cb(null, `${file.originalname}-${Date.now()}`);
    }
});

const upload = multer({storage});

router
    .post('/myResume', ensureAuth, upload.single('file'), (req, res, next) => {
        const name = req.body.name;
        const data = fs.readFileSync(req.file.path);

        return new Resume({ file: data, name: name }).save()
            .then(resume => {
                res.send(resume._id);
            })
            .catch(next);
    })
    .patch('/myResume/:id', ensureAuth, bodyParser, (req, res, next) => {
        const payload = {};
        if(req.body.name) {payload.name = req.body.name;}
        if(req.body.skills) {payload.$push = {skills: req.body.skills};}
        if(req.body.location) {payload.location = req.body.location;}

        payload.updated = new Date();
        payload.user = req.user.id;
        
        Resume.findByIdAndUpdate(req.params.id, payload, {new: true})
            .then(resume => res.send(resume._id))
            .catch(next);
    })
    .get('/myResume', ensureAuth, (req, res, next) => {
        Resume.findOne({ user: req.user.id })
            .then(resume => {
                res.set('Content-Type', 'application/pdf');
                res.send(resume.file);
            })
            .catch(next);
    })
    .get('/resumes', ensureAuth, /*ensureRole,*/ (req, res, next) => {    //returns ID's of resumes for next step in filter search TODO: add ensureRole
        Resume.find({skills: {$in: req.query.skills }}, '_id').sort({ updated: 1 })
        .then(resumes => {
            res.send(resumes);
        })
        .catch(next);
    })
    .get('/resume/:id', ensureAuth, /*ensureRole,*/ (req, res, next) => {
        Resume.findById(req.params.id)
            .then(resume => {
                res.set('Content-Type', 'application/pdf');
                res.send(resume.file);
            })
            .catch(next);
    }) //TODO add ensure role || front end must hold previous get's results in an array and loop through to feed this get
    .delete('myResume/:id', ensureAuth, (req, res, next) => {
        Resume.findByIdAndRemove(req.params.id)
            .then( () => 
                res.send({ message: 'This Resume Has Been Deleted' }))
            .catch(next);
    });

module.exports = router;
