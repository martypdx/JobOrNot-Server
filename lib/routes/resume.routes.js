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
        console.log('req: ', req.file);
        const name = req.body.name;
        const data = fs.readFileSync(req.file.path);
        // const userId = req.body.user._id;

        return new Resume({ file: data, name: name }).save()
            .then(resume => {
                res.send(resume);
            })
            .catch(next);
    })
    .patch('/myResume/:id', ensureAuth, bodyParser, (req, res, next) => {
        //TODO front end handles holding resume id in state which feeds req.params.id in backend
        console.log('INSIDE OF PATCH ROUTE');
        const payload = {};
        if(req.body.name) {payload.name = req.body.name;}
        if(req.body.skills) {payload.$push = {skills: req.body.skills};}
        if(req.body.location) {payload.location = req.body.location;}

        payload.user = req.user.id;
        Resume.findByIdAndUpdate(req.params.id, payload, {new: true})
            .then(resume => res.send(resume.skills))
            .catch(next);
    })
    .get('/myResume', ensureAuth, (req, res, next) => {
        Resume.findOne({ user: req.body.user._id })
            .then(resume => {
                res.set('Content-Type', 'application/pdf');
                res.send(resume.file);
            })
        // User.findById(req.user._id)
        //     .select('myResume')
        //     .lean()
        //     .populate('myResume.file')
        //     .then(resume => {
        //         if(!resume){
        //             res.status(404).send({ error: 'Cannot Find Resume' });
        //         } else {
        //             res.set('Content-Type', 'application/pdf');
        //             res.send(resume);
        //         }            })
            .catch(next);
    })
    // .get('/resumes', ensureAuth, ensureRole, (req, res, next) => {
    //     Resume.find(

    //     );
    // }) //mongoaggregation stuff
    .delete('myResume/:id', ensureAuth, (req, res, next) => {
        Resume.findByIdAndRemove(req.params.id)
            .then( () => 
                res.send({ message: 'This Resume Has Been Deleted' }))
            .catch(next);
    });

module.exports = router;
