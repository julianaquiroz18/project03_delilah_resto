const { ValidationError } = require('express-json-validator-middleware');

/**
 * @method errorHandler
 * @description Middleware that manages the errors
 */

const errorHandler = ((err, req, res, next) => {
    if (err instanceof ValidationError) {
        res.status(400).send({
            code: 400,
            error: 'Invalid input'
        });
        next();
    } else {
        res.status(err.status).send({
            code: err.status,
            error: err.message
        });
        next();
    };
});

module.exports = {
    errorHandler
};