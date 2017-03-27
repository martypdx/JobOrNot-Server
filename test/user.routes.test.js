const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const assert = chai.assert;

const app = require('../lib/app');
const mongoose = require('mongoose');

process.env.DB_URI = 'mongodb://localhost:27017/user-routes-test';
require('../lib/connection');

describe('user', () => {
    before(() => mongoose.connection.dropDatabase());

    const user = {
        username: 'user',
        password: 'password',
        name: 'faker mcuser',
        email: 'fakeEmail@fakeEmail.com'
    };

    const request = chai.request(app);

    describe('user management', () => {
        
        const badRequest = (url, data, error) =>
            request
                .post(url)
                .send(data)
                .then(
                    () => { throw new Error('Status should not be OK'); },
                    res => {
                        assert.equal(res.status, 400);
                        assert.equal(res.response.body.error, error);
                    }
                );
    
        it('signup requires username', () =>
            badRequest('/signup', { password: 'password' },
            'Username and Password Must Be Provided')
        );

        it('signup requires password', () => 
            badRequest('/signup', { username: 'username' }, 'Username and Password Must Be Provided')
        );

        let token = '';

        it('signup', () => 
            request
                .post('/signup')
                .send(user)
                .then(res => assert.ok(token = res.body.token))
        );

        it('can\'t use same username', () => 
            request
                .post('/signup')
                .send(user)
                .then(
                    () => { throw new Error('status should not be ok'); },
                    res => {
                        assert.equal(res.status, 400);
                        assert.equal(res.response.body.error, `Username ${user.username} already exists`);
                    }
                )
        );

        it('signin requires username', () => 
            badRequest('/signin', { password: 'password' }, 'Username and Password Must Be Provided')
        );

        it('signin requires password', () =>
            badRequest('/signin', { username: 'user' }, 'Username and Password Must Be Provided')
        );

        it('signin with wrong user', () =>
            request
                .post('/signin')
                .send({ username: 'bad user', password: user.password })
                .then(
                    () => { throw new Error('status should not be ok');},
                    res => {
                        assert.equal(res.status, 400);
                        assert.equal(res.response.body.error, 'invalid username or password');
                    }
                )
        );

        it('user can update properties of the user object', () => {
            return request
                .post('/signin')
                .send({ username: user.username, password: user.password, email: user.email })
                .then(res => res.body.token)
                .then((token) => {
                    console.log(token);
                    return request
                        .patch('/changeAccountInfo')
                        .send({ username: 'changedUser'})
                        .set('Authorization', token);
                })
                .then(res => {
                    console.log(res.body);
                    assert.equal(res.body.username, 'changedUser');
                });
        });

        it('user can delete their account', () => {
            return request
                .post('/signin')
                .send({ username: 'changedUser', password: user.password, email: user.email })
                .then(res => res.body.token)
                .then((token) => {
                    console.log('TOKEN', token);
                    return request
                        .delete('/deleteAccount')
                        .send(user._id)
                        .set('Authorization', token);
                })
                .then(res => {
                    assert.equal(res.body.message, 'Your user account has been deleted!');
                });
        });
    });
});             