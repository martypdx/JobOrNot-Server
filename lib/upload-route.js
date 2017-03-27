const router = require('express').Router();
const Resume = require('./models/resume.schema');
const multer = require('multer');
const bodyParser = require('body-parser').json();

const storage = multer.diskStorage({
    destination: './files',
    filename(req, file, cb) {
        cb(null, `${new Date()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

router
    .post('/', bodyParser, upload.single('file'), (req, res, next) => {
        console.log('hello');
        return new Resume(req.body).save()
            .then(resume => {
                res.send(resume);
            })
            .catch(next);
    });

module.exports = router;
