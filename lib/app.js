const express = require('express');
const app = express();
const errorHandler = require('./error-handler');
const morgan = require('morgan');
const cors = require('cors');
const upload = require('./upload-route');

app.use(cors());
app.use(morgan('dev'));
app.use(express.static('./public'));
app.use('/files', upload);
app.use(errorHandler());

module.exports = app;