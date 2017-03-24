module.exports = function getEnsureRole() {
    return function ensureRole(req, res, next) {
        const roles = req.user.roles;
        if(roles === 'recruiter') next();
        else next({
            code: 403,
            error: 'Unauthorized Action'
        });
    };
};