const mongoose = require('mongoose');

require('../lib/connection');
process.env.MONGODB_URI = 'mongodb://localhost:27017/user-routes-test';

before(() => {
    mongoose.connection.dropDatabase(() => {
        console.log('db dropped');
    });
});