const router = require('express').Router();
const Resume = require('../models/resume.schema');
const multer = require('multer');
const fs = require('fs');

const token = require('../auth/token');
const ensureAuth = require('../auth/ensure-auth')();

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
    .post('/', ensureAuth, upload.single('file'), (req, res, next) => {
        console.log('req: ', req.file);
        const name = req.body.name;
        const data = fs.readFileSync(req.file.path);

        return new Resume({ file: data, name: name }).save()
            .then(resume => {
                res.send(resume);
            })
            .catch(next);
    })
    .get('/:id', ensureAuth, (req, res, next) => {
        Resume.findById({ _id: req.params.id })
            .then(resume => {
                if(!resume){
                    res.status(404).send({ error: 'Cannot Find Resume' });
                } else res.send(resume);
            })
            .catch(next);
    })
    //write get for recruiters with ensure role --> write functionality for showing random resumes within constraints of keywords
    .delete('/:id', ensureAuth, (req, res, next) => {
        console.log('HI', req.params.id);
        Resume.findByIdAndRemove(req.params.id)
            .then( () => 
                res.send({ message: 'This Resume Has Been Deleted' }))
            .catch(next);
    });

module.exports = router;
