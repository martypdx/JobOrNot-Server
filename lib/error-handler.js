// catch errors coming back through express
module.exports = function getErrorHandler() {
    return function errorHandler(err, req, res, next) { // eslint-disable-line
        let code = 500;
        let error = 'Internal Server Error';

        // mongoose threw us an error 
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            code = 400;
            error = err.name;
        } else if (err.code) {
            code = err.code;
            error = err.error;
            console.log(err.code, err.error);
        } else {
            console.log('reporting err');
        }
        res.status(code).send({ error });
    };
};
