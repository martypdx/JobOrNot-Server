const jwt = require('jsonwebtoken-promisified');
// make sure to use APP_SECRET env variable in production
const sekrit = process.env.APP_SECRET || 'change-me';

module.exports = {
    sign(user){
        const payload = {
            id: user._id,
            roles: user.role
        };
        return jwt.signAsync(payload, sekrit);
    },
    verify(token) {
        return jwt.verifyAsync(token, sekrit);
    }
};