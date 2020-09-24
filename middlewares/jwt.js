const jwt = require('jsonwebtoken');

/**
 *
 */
const jwtGenerator = ((req, res, next) => {
    const token = jwt.sign(
        req.body,
        `${process.env.SECRET_KEY_JWT}`, { expiresIn: '60s' }
    );
    req.token = token;
    next();
});

/**
 *
 */
const jwtExtract = ((req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        const error = new Error("Error you are not authorized");
        error.status = 403;
        next(error);
    }
});

module.exports = {
    jwtGenerator: jwtGenerator,
    jwtExtract: jwtExtract
};