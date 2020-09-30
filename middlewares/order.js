const { getDBModels } = require('../database');

/**
 * Check if products Arrays is correct
 */
async function checkProductArray(req, res, next) {
    const productsArray = req.body.products;
    if (productsArray.length === 0) {
        const error = new Error("Order must have at least one product")
        error.status = 400;
        return next(error);
    };
    const Products = (await getDBModels()).Product;
    let error;
    for (let product of productsArray) {
        if (!(Number.isInteger(product))) {
            error = new Error("Invalid products input")
            error.status = 400;
            break;
        }
        const id = await Products.findOne({
            where: { id: product }
        });
        if (!id) {
            error = new Error("Product does not exist")
            error.status = 404;
            break;
        }
    };
    return error ? next(error) : next();
};

/**
 * Check if orderID is valid
 */
async function checkOrderID(req, res, next) {
    const Orders = (await getDBModels()).Order;
    try {
        const id = await Orders.findOne({
            where: { id: Number(req.params.orderID) }
        });
        if (id) {
            return next();
        } else {
            throw error;
        }
    } catch {
        const error = new Error("Invalid order ID. Order does not exist");
        error.status = 404;
        next(error);
    }
};


module.exports = {
    checkProductArray,
    checkOrderID
}