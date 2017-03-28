const express = require('express');
const app = express();
const errorHandler = require('./error-handler');
const morgan = require('morgan');
const cors = require('cors');
const upload = require('./routes/upload-route');
const userRouter = require('./routes/user.routes');
// const ensureAuth = require('./auth/ensure-auth');
// const ensureRole = require('./auth/ensure-role');

app.use(cors());
app.use(morgan('dev'));
app.use(express.static('./public'));
app.use('/myResume', upload);
app.use('/', userRouter);
app.use(errorHandler());

module.exports = app;