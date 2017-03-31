const jwt = require('jsonwebtoken-promisified');
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