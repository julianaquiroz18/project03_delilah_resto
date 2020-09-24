const jwt = require('jsonwebtoken');

/**
 *
 */
const jwtGenerator = ((req, res, next) => {
    const infoToken = req.userInfo[0].dataValues;
    delete infoToken.password;
    const token = jwt.sign(
        infoToken,
        `${process.env.SECRET_KEY_JWT}`,
        //{ expiresIn: '60s' }
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
        const error = new Error("Missing or invalid token");
        error.status = 403;
        next(error);
    }
});

/**
 * 
 */
function verifyToken(req, res, next) {
    jwt.verify(
        req.token, `${process.env.SECRET_KEY_JWT}`, (err, data) => {
            if (err) {
                const error = new Error("Invalid token");
                error.status = 403;
                next(error);
            } else {
                req.userInfo = data;
                next();
            }
        }
    )
};

module.exports = {
    jwtGenerator,
    jwtExtract,
    verifyToken
};