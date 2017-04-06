const fs = require('fs');
const chai = require('chai');
const assert = chai.assert;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const app = require('../lib/app');
const request = chai.request(app);

const Resume = require('../lib/models/resume.schema');

//IMPORTANT NOTE: many of these tests for resume routes at this time cannot be successfully conducted: There is a hang-up with posting a resume while in test, that has yet to be solved. Thus, attempting to post, delete, or patch a resume will not work until the problem is discovered and fixed.

describe('resume', () => {
    
    describe('resume management', () => {
        const testResume = fs.readFileSync(__dirname + '/hotelmanagement.pdf');

        const user2 = {
            username: 'hagrid',
            password: 'youreawizardharry!'
        };

        const user3 = {
            username: 'voldemort',
            password: 'evilllllll'
        };

        it('can post a resume', () => {
            request
                .post('/signup')
                .send(user2)
                .then(res => {
                    return res.body.token;
                })
                .then((token) => {
                    return request
                        .post('/myResume')
                        .set('Authorization', token)
                        .set('Content-Type', 'application/octet-stream')
                        .send(testResume)
                        .then(res => {
                            assert.ok(res.body.file);
                        });
                });
        }); //this test is currently not making it to the asset block for reasons that elude me... the error messages refer to broken promise chains and being unable to read property 'name' of undefined, which seems to indicate a problem with the resume .pdf itself, but in logging the resume in the console we see that it is in fact becoming the buffer we need it to be. Async problems may also be indicated because unless the other tests run, we don't get our console log 'MADE IT HERE'.
    
        it('updates resume skills and user reference', () => {

            let data = {
                skills: ['management'],
                user: '5810A459'
            };
            request
                .post('/signup')
                .send(user3)
                .then(res => {
                    res.body;
                })
                .then((body) => {
                    return request
                        .patch(`/myResume/${body._id}`)
                        .send(data)
                        .set('Authorizaton', body.token)
                        .then(res => {
                            assert.deepEqual(res.body.testResume3.skills, ['management']);
                        });
                });
        });

        it('deleting a resume requires a user to be signed in and authenticated', () => {
            let testresume2 = new Resume({
                file: fs.readFileSync(__dirname + '/hotelmanagement.pdf'),
                name: 'testRes'
            });
        
            request
                .delete(`/myResume/${testresume2._id}`)
                .then(res => {
                    assert.equal(res.status, 401);
                    assert.equal(res.response.body.error, 'Unauthorized');
                })
                .catch(() => { throw new Error('Status should not be OK'); });
        });

        it('user can delete their own resume', () => {
            let testresume3 = new Resume({
                file: fs.readFileSync(__dirname + '/hotelmanagement.pdf'),
                name: 'testRes',
                user: user2._id
            });

            console.log('RES USER', testresume3.user);
            request
                .post('/signin')
                .send(user2)
                .then(res => {
                    console.log('MADE IT HERE', res.body);
                    res.body.token;
                })
                .then((token) => {
                    return request
                        .delete(`/myResume/${testresume3._id}`)
                        .set('Authorization', token)
                        .then(res => {
                            console.log(res.body.message);
                            assert.equal(res.body.message, 'This Resume Has Been Deleted');
                        });
                });
        });

        // would be good to test that a user can NOT delete someone else's resume!!!
        
    });
});