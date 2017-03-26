const app = require('express')();
const errorHandler = require('./error-handler');
const morgan = require('morgan');
const cors = require('cors');

const userRouter = require('./routes/user.routes');
const ensureAuth = require('./auth/ensure-auth');
const ensureRole = require('./auth/ensure-role');

app.use(cors());
app.use(morgan('dev'));
app.use('/', ensureAuth(), ensureRole(), userRouter);
app.use(errorHandler());

module.exports = app;