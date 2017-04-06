const mongoose = require('mongoose');

require('../lib/connection');
process.env.MONGODB_URI = 'mongodb://localhost:27017/user-routes-test';

before((done) => {
    const drop = () => mongoose.connection.dropDatabase(() =>{
        done();
    });
    if(mongoose.connection.readyState === 1) drop();
    else mongoose.connection.on( 'open', drop);
});