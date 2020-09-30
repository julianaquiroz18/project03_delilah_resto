const { getDBModels } = require('../database');
/**
 * Get product info
 */
function getProductInfo(req, res, next) {
    req.newProduct = {
        img: req.body.img,
        name: req.body.name,
        price: req.body.price
    };
    next();
};

/**
 * Check if product already exist
 */
async function checkProduct(req, res, next) {
    const Products = (await getDBModels()).Product;
    const productInfo = await Products.findAll({
        where: { name: req.newProduct.name }
    });
    if (productInfo.length === 0) {
        next();
    } else {
        const error = new Error("This product already exist");
        error.status = 409;
        next(error);
    };
};

/**
 * Check if product ID exist
 */
async function checkProductID(req, res, next) {
    const Products = (await getDBModels()).Product;
    try {
        const id = await Products.findOne({
            where: { id: Number(req.params.productID) }
        });
        if (id) {
            return next();
        } else {
            throw error;
        }
    } catch {
        const error = new Error("Invalid product ID. Product does not exist");
        error.status = 404;
        next(error);
    }
};

module.exports = {
    getProductInfo,
    checkProduct,
    checkProductID
}