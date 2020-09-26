const { getDBModels } = require('../database');
/**
 * Get models from database
 */
async function getModels(req, res, next) {
    const models = await getDBModels();
    req.models = models;
    next();
};

module.exports = {
    getModels
}