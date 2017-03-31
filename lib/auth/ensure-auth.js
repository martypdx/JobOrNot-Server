const token = require('./token');

module.exports = function getEnsureAuth() {
    return function ensureAuth(req, res, next) {
        const accessToken = req.get('Authorization') || req.query.accessToken;
        token.verify(accessToken)
            .then(payload => {
                req.user = payload;
                next();
            })
            .catch(() => {
                next({
                    code: 401,
                    error: 'Unauthorized'
                });
            });
    };
};