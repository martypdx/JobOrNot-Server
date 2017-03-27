const mongoose = require('mongoose');

process.env.MONGODB_URI = 'mongodb://localhost:27017/user-routes-test';
require('../lib/connection');

before(() => {
    mongoose.connection.dropDatabase();
});