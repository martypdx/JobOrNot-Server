const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const assert = chai.assert;
const app = require('../lib/app');
const request = chai.request(app);

describe('upload routes', () => {
    let resumeOne = {
        resumeImage: './Resume-Nov2016.pdf'
    };

    it('POST to /files adds a new resume', () => {
        return request.post('/files')
            .send(resumeOne)
            .then(res => {
                assert.isOk(res.body._id);
                resumeOne._id = res.body._id;
                resumeOne.__v = res.body.__v;
                assert.deepEqual(res.body, resumeOne);
            });
    });
});