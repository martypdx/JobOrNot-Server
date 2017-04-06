const express = require('express');
const app = express();
const errorHandler = require('./error-handler')();
const morgan = require('morgan');
const cors = require('cors')();
const upload = require('./routes/resume.routes');
const userRouter = require('./routes/user.routes');

app.use(cors);
app.use(morgan('dev'));
app.use(express.static('./public'));
app.use('/', /*ensureAuth, */ upload); 
app.use('/', userRouter);
app.use(errorHandler);

module.exports = app;