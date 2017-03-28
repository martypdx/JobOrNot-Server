const router = require('express').Router();
const Resume = require('../models/resume.schema');
const multer = require('multer');
const fs = require('fs');

const token = require('../auth/token');
const ensureAuth = require('../auth/ensure-auth');

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
    .post('/', upload.single('file'), (req, res, next) => {
        console.log('req: ', req.body);
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
    .delete('/:id', ensureAuth, bodyParser, (req, res, next) => {
        Resume.findByIdAndRemove(req.params.id)
            .then( () => res.send({ message: 'This Resume Has Been Deleted' }))
            .catch(next);
    });

module.exports = router;
