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
                // User.findByIdAndUpdate(userId, { myResume: resume._id });
                res.send(resume);
            })
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
