const router = require('express').Router();
const Resume = require('../models/resume.schema');
const User = require('../models/user.schema');
const multer = require('multer');
const fs = require('fs');
const ensureAuth = require('../auth/ensure-auth')();
const bodyParser = require('body-parser').json();

const storage = multer.diskStorage({
    destination: './tmp',
    filename(req, file, cb) {
        cb(null, `${file.originalname}-${Date.now()}`);
    }
});

const upload = multer({storage});

// since ensureAuth is on ALL the routes, better to promote to adding in app.js on app.use()

router
    .post('/myResume', upload.single('file'), (req, res, next) => {
        const name = req.body.name;
        // never EVER EVER EVER EVER EVER EVER EVER EVER EVER 
        // use sync fs methods in server code.
        // Node.JS cannot handle any other requests while it is waiting, so your server won't scale.
        // Only legitimate use is for tests and small sandbox projcts.
        // const data = fs.readFileSync(req.file.path);

        fs.readFile(req.file.path, (err, data) => {
            if (err) return next(err);
            // (or better yet, get a promisified version of fs)

            new Resume({ file: data, name: name }).save()
                .then(resume => {
                    res.send(resume._id);
                })
                .catch(next);

        });
    })
    .patch('/myResume/:id', bodyParser, (req, res, next) => {
        // This code would be better in a custom static model method
        const payload = {};
        if(req.body.name) {payload.name = req.body.name;}
        if(req.body.skills) {
            payload.$push = {skills: { $each: req.body.skills}};
        }
        if(req.body.location) {payload.location = req.body.location;}

        payload.updated = new Date();
        payload.user = req.user.id;

        Resume.findByIdAndUpdate(req.params.id, payload, {new: true})
            .then(resume => res.send(resume._id))
            .catch(next);
    })
    .get('/resumes', (req, res, next) => {
        Resume.find({skills: {$in: req.query.skills }}, '_id name timesViewed')
            .sort({ updated: 1 })
            .lean()
            .then(resumes => {
                res.send(resumes);
            })
            .catch(next);
    })
    // These should be plural too:
    .get('/resumes/:id/pdf', (req, res, next) => {
        Resume.findById(req.params.id)
            .lean()
            .select('file')
            .then(resume => {
                res.set('Content-Type', 'application/pdf');
                res.send(resume.file);
            })
            .catch(next);
    }) 
    .get('/resumes/:id', (req, res, next) => {
        Resume.findById(req.params.id)
            .lean()
            .select('name')
            .then(resume => {
                res.send(resume.name);
            })
            .catch(next);
    })
    .get('/resumes/:id/stats', (req, res, next) => {
        Resume.findOne({ user: req.params.id })
            .lean()
            .select('timesViewed likedBy name, skills')
            .then(resume => {
                // because fields are the one we want, no need to manually copy
                res.send(resume);
            })
            .catch(next);
    })
    // This route is oddly named. I would make it something like:
    //.put(/resumes/liked/:id)
    .patch('/resume/:id', bodyParser, (req, res, next) => {
        
        User.findById(req.user.id)
            .then(user => {
                user.likedResumes.push(req.params.id);
                user.markModified('likedResumes');
                user.save();
            })
            .catch(next);

        const payload = {};
        if(req.user.id) {payload.$push = {likedBy: req.user.id};}
        if(req.body.timesViewed) {payload.timesViewed = req.body.timesViewed;}

        Resume.findByIdAndUpdate(req.params.id, payload, {new: true})
            .then(resume => res.send(resume.likedBy))
            .catch(next);
    })
    .delete('myResume/:id', (req, res, next) => {
        Resume.findByIdAndRemove(req.params.id)
            .then( () => 
                res.send({ message: 'This Resume Has Been Deleted' }))
            .catch(next);
    });

module.exports = router;
