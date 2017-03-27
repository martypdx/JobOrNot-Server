const router = require('express').Router();
const Resume = require('../models/resume.schema');
const multer = require('multer');
const fs = require('fs');

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
        console.log('req: ', req);
        const name = req.body.name;
        const data = fs.readFileSync(req.file.path);

        return new Resume({ file: data, name: name }).save()
            .then(resume => {
                res.send(resume);
            })
            .catch(next);
    });

module.exports = router;
