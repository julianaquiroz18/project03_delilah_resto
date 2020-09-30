const express = require('express');
const router = express.Router();

/**
 * Middlewares
 */
const { getModels } = require('../middlewares/dbModels');
const { getUserInfo, checkUser, login, checkIfAdmin, checkUserID, checkUserToUpdate } = require('../middlewares/user');
const { getProductInfo, checkProduct, checkProductID, checkProducToUpdate } = require('../middlewares/product')
const { checkProductArray, checkOrderID } = require('../middlewares/order');
const { jwtGenerator, jwtExtract, verifyToken } = require('../middlewares/jwt');


/**
 * Schema validator
 */
const { registerSchema, productSchema, orderSchema, orderStatusSchema } = require('../schemas/schemas');
const { Validator } = require('express-json-validator-middleware');
const validator = new Validator({ allErrors: true });
const validate = validator.validate;

/**
 * Get user list (Only admin)
 */
router.get("/users", getModels, jwtExtract, verifyToken, checkIfAdmin, async(req, res) => {
    const User = req.models.User;
    const userList = await User.findAll();
    res.status(200).json(userList);
});

/**
 * User registration
 */
router.post("/users", validate({ body: registerSchema }), getUserInfo, getModels, checkUser, async(req, res) => {
    const User = req.models.User;
    const newUser = await User.create(req.userRegistrationInfo);
    delete newUser.password;
    res.status(201).json(newUser);
});

/**
 * Login
 */
router.get("/users/login", login, jwtGenerator, (req, res) => {
    res.status(200).json({
        message: "Successful login",
        token: req.token
    });
});


/**
 * Get user by id (only admin)
 * User can only acces to self information using "me" 
 */
router.get("/users/:userID", getModels, jwtExtract, verifyToken, checkUserID, async(req, res) => {
    const User = req.models.User;
    if (req.params.userID === "me") {
        const user = await User.findOne({
            where: { id: Number(req.userInfo.id) }
        });
        return res.status(200).json(user);
    }
    if (req.userInfo.isAdmin) {
        const user = await User.findOne({
            where: { id: Number(req.params.userID) }
        });
        delete user.dataValues.password;
        return res.status(200).json(user);
    }
    res.status(403).send({
        code: 403,
        message: "You don't have permission to complete this action"
    });
});


/**
 * Update user by id (only admin)
 * User can only acces to self information using "me" 
 */
router.put("/users/:userID", getModels, jwtExtract, verifyToken, checkUserID, validate({ body: registerSchema }), getUserInfo, checkUserToUpdate, async(req, res) => {
    const User = req.models.User;
    if (req.params.userID === "me") {
        await User.update(req.userRegistrationInfo, {
            where: { id: Number(req.userInfo.id) }
        });
        return res.status(200).send("User information was updated");
    }
    if (req.userInfo.isAdmin) {
        await User.update(req.userRegistrationInfo, {
            returning: true,
            where: { id: Number(req.params.userID) }
        });
        return res.status(200).send("User information was updated");
    }
    res.status(403).send({
        code: 403,
        message: "You don't have permission to complete this action"
    });
});


/**
 * Get products list
 */
router.get("/products", getModels, async(req, res) => {
    const Products = req.models.Product;
    const productsList = await Products.findAll();
    res.status(200).json(productsList);
});

/**
 * Create product (only admin)
 */
router.post("/products", jwtExtract, verifyToken, checkIfAdmin, validate({ body: productSchema }), getProductInfo, checkProduct, getModels, async(req, res) => {
    const Products = req.models.Product;
    const newProduct = await Products.create(req.newProduct);
    res.status(201).json(newProduct);
});


/**
 * Get product by id 
 */
router.get("/products/:productID", getModels, checkProductID, async(req, res) => {
    const Products = req.models.Product;
    const product = await Products.findOne({
        where: { id: Number(req.params.productID) }
    });
    res.status(200).json(product);
});

/**
 * Update product by id (only admin)
 */
router.put("/products/:productID", jwtExtract, verifyToken, checkIfAdmin, checkProductID, validate({ body: productSchema }), getProductInfo, checkProducToUpdate, getModels, async(req, res) => {
    const Products = req.models.Product;
    await Products.update(req.body, {
        where: { id: Number(req.params.productID) }
    });
    res.status(200).send("Product information was updated");
});

/**
 * Delete product by id (only admin)
 */
router.delete("/products/:productID", jwtExtract, verifyToken, checkIfAdmin, checkProductID, getModels, async(req, res) => {
    const Products = req.models.Product;
    await Products.destroy({
        where: { id: Number(req.params.productID) }
    });
    res.status(200).send("Product was deleted");
});

/**
 * Get all orders 
 */
router.get("/orders", getModels, jwtExtract, verifyToken, async(req, res) => {
    const Orders = req.models.Order;
    const User = req.models.User;
    const Product = req.models.Product;
    if (req.userInfo.isAdmin) {
        const ordersList = await Orders.findAll({
            include: [{
                model: User,
                attributes: ['fullname', 'username', 'email', 'phoneNumber', 'address'],
            }, {
                model: Product,
                attributes: ['img', 'name', 'price']
            }]
        });
        return res.status(200).json(ordersList);
    }
    const user = await User.findByPk(req.userInfo.id);
    const userOrders = await user.getOrders({
        include: {
            model: Product,
            attributes: ['img', 'name', 'price']
        }
    });
    if (userOrders.length != 0) {
        res.status(200).json(userOrders);
    } else {
        res.status(200).send("You dont have any order");
    }

});

/**
 * Create order
 */
router.post("/orders", jwtExtract, verifyToken, validate({ body: orderSchema }), checkProductArray, getModels, async(req, res) => {
    const Orders = req.models.Order;
    const newOrder = await Orders.create({
        status: "nuevo",
        paymentMethod: req.body.paymentMethod,
    });
    newOrder.setUser(req.userInfo.id);
    newOrder.addProduct(req.body.products);
    res.status(201).send(`Your order was created! Order number: ${newOrder.id}`);
});

/**
 * Get Order by id (only admin)
 * User can only acces to self orders 
 */
router.get("/orders/:orderID", getModels, jwtExtract, verifyToken, checkOrderID, async(req, res) => {
    const Orders = req.models.Order;
    const User = req.models.User;
    const Product = req.models.Product;
    if (req.userInfo.isAdmin) {
        const order = await Orders.findOne({
            include: [{
                model: User,
                attributes: ['fullname', 'username', 'email', 'phoneNumber', 'address'],
            }, {
                model: Product,
                attributes: ['img', 'name', 'price'],
            }],
            where: { id: Number(req.params.orderID) }
        });
        return res.status(200).json(order);
    }
    const user = await User.findByPk(req.userInfo.id);
    const userOrder = await user.getOrders({
        include: {
            model: Product,
            attributes: ['img', 'name', 'price'],
        },
        where: { id: Number(req.params.orderID) }
    });
    if (userOrder.length != 0) {
        res.status(200).json(userOrder);
    } else {
        res.status(404).send({
            code: 404,
            message: "Incorrect Order ID"
        });
    }
});

/**
 * Update order by id (only admin)
 */
router.put("/orders/:orderID", jwtExtract, verifyToken, checkIfAdmin, checkOrderID, validate({ body: orderStatusSchema }), getModels, async(req, res) => {
    const Orders = req.models.Order;
    await Orders.update(req.body, {
        where: { id: Number(req.params.orderID) }
    });
    res.status(200).send(`Order #${req.params.orderID} status was updated`);
});

module.exports = {
    router: router
}