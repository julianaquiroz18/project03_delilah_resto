const { getDBModels } = require('../database');
const { Op } = require("sequelize");
const CryptoJS = require("crypto-js");

/**
 * Get user information from registration
 */
function getUserInfo(req, res, next) {
    req.userRegistrationInfo = {
        username: req.body.username,
        fullname: req.body.fullname,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        password: encryptPassword(req.body.password),
        isAdmin: req.body.isAdmin || 0
    };
    next();
};

function encryptPassword(password) {
    return CryptoJS.AES.encrypt(password, `${process.env.SECRET_KEY_PASS}`).toString();
}

/**
 * Check if user already exist
 */
async function checkUser(req, res, next) {
    const User = (await getDBModels()).User;
    const userInfo = await User.findAll({
        where: {
            [Op.or]: [
                { username: req.userRegistrationInfo.username },
                { email: req.userRegistrationInfo.email }
            ]
        }
    });
    if (userInfo.length === 0) {
        next();
    } else {
        const error = new Error("User or email already exist");
        error.status = 409;
        next(error);
    }
}

/**
 * Authentication
 */
async function login(req, res, next) {
    const usernameOrEmail = req.body.usernameOrEmail;
    const passwordLogin = req.body.password;
    const User = (await getDBModels()).User;
    const userInfo = await User.findAll({
        where: {
            [Op.or]: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        }
    });
    if (userInfo.length === 0) {
        const error = new Error("Wrong user/email");
        error.status = 401;
        return next(error);
    };
    if (passwordLogin != decryptPassword(userInfo[0].dataValues.password)) {
        const error = new Error("Wrong password");
        error.status = 401;
        return next(error);
    };
    req.userInfo = userInfo;
    next();
};

function decryptPassword(cipherPassword) {
    const bytes = CryptoJS.AES.decrypt(cipherPassword, `${process.env.SECRET_KEY_PASS}`);
    return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Check if user is admin
 */
function checkIfAdmin(req, res, next) {
    if (req.userInfo.isAdmin === false) {
        const error = new Error("You don't have permission to complete this action");
        error.status = 403;
        next(error);
    } else {
        next();
    };
};

/**
 * Check if userID is valid
 */
async function checkUserID(req, res, next) {
    const User = (await getDBModels()).User;
    if (req.params.userID === "me") {
        return next();
    };
    try {
        const id = await User.findOne({
            where: { id: Number(req.params.userID) }
        });
        if (id) {
            return next();
        } else {
            throw error;
        }
    } catch {
        const error = new Error("Invalid User ID. User does not exist");
        error.status = 404;
        next(error);
    }
};

module.exports = {
    getUserInfo,
    login,
    checkIfAdmin,
    checkUser,
    checkUserID
}