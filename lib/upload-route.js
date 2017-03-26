const router = require('express').Router();
const Resume = require('./models/resume.schema');
const multer = require('multer');
const bodyParser = require('body-parser');

const storage = multer.diskStorage({
    destination: './files',
    filename(req, file, cb) {
        cb(null, `${new Date()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

router
    .post('/files', bodyParser, upload.single('file'), (req, res, next) => {
        return new Resume(req.body).save()
            .then(resume => {
                res.send(resume);
            })
            .catch(next);
    });

module.exports = router;
