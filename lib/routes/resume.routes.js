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
    .get('/myResume', ensureAuth, (req, res, next) => {
        Resume.findOne({ user: req.body.user._id })
            .then(resume => {
                res.set('Content-Type', 'application/pdf');
                res.send(resume.file);
            })
            .catch(next);
    })
    .get('/resumes', ensureAuth, (req,res, next) => {
        Resume.find()
            .then(resumes => {
                const resumeArray = resumes.map(resume => {
                    return resume._id;
                });
                return resumeArray;
            })
            .then(resumes => {
                res.send(resumes);
            })
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
