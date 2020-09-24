const { getDBModels } = require('../database');
const { Op } = require("sequelize");

async function getModels(req, res, next) {
    const models = await getDBModels();
    req.models = models;
    next();
};

function getUserInfo(req, res, next) {
    req.userInfo = {
        username: req.body.username,
        fullname: req.body.fullname,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        password: req.body.password
    };
    next();
};

async function login(req, res, next) {
    const usernameOrEmail = req.body.usernameOrEmail;
    const passwordLogin = req.body.password;
    const User = (await getDBModels()).User;
    const userInfo = await User.findAll({
        where: {
            [Op.and]: [{
                    [Op.or]: [
                        { username: usernameOrEmail },
                        { email: usernameOrEmail }
                    ]
                },
                { password: passwordLogin }
            ]
        }
    });
    if (userInfo.length === 0) {
        const error = new Error("Wrong user/email or password");
        error.status = 401;
        next(error);
    } else {
        req.userInfo = userInfo;
        next()
    }
};

function checkIfAdmin(req, res, next) {
    if (req.userInfo.isAdmin === false) {
        const error = new Error("You don't have permission to complete this action");
        error.status = 403;
        next(error);
    } else {
        next();
    }
}

module.exports = {
    getModels,
    getUserInfo,
    login,
    checkIfAdmin
}