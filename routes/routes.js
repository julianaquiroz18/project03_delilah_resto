const express = require('express');
const router = express.Router();

/**
 * Middlewares
 */
const { getModels } = require('../middlewares/dbModels');
const { getUserInfo, checkUser, login, checkIfAdmin, checkUserID } = require('../middlewares/user');
const { getProductInfo, checkProduct, checkProductID } = require('../middlewares/product')
const { jwtGenerator, jwtExtract, verifyToken } = require('../middlewares/jwt');


/**
 * Schema validator
 */
const { registerSchema, productSchema } = require('../schemas/schemas');
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
router.put("/users/:userID", getModels, jwtExtract, verifyToken, validate({ body: registerSchema }), getUserInfo, checkUserID, async(req, res) => {
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
 * Create product
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
 * Update product by id 
 */
router.put("/products/:productID", jwtExtract, verifyToken, checkIfAdmin, validate({ body: productSchema }), checkProductID, getModels, async(req, res) => {
    const Products = req.models.Product;
    await Products.update(req.body, {
        where: { id: Number(req.params.productID) }
    });
    res.status(200).send("Product information was updated");
});


module.exports = {
    router: router
}



// router.get(BASE_PATH, async (req, res) => {
//     // const Deportistas = (await getModels()).Deportistas;
//     const { Deportista, Pais } = await getModels();
//     const data = await Deportista.findAll({
//       include: [
//         {
//           model: Pais,
//           as: 'pais',
//           attributes: ['nombre']
//         }
//       ]
//     });
//     res.json(data);
//   })

//   router.post(`${BASE_PATH}`, async (req, res) => {
//     const { Deportista, Pais } = await getModels();
//     const pais = await Pais.findOne({nombre: req.body.pais});
//     const deportista = await Deportista.create(req.body);
//     deportista.paisId = pais.id;
//     try {
//       const data = await deportista.save();
//       res.status(202).json(data);
//     } catch (error) {
//       res.status(500).json({message: error.message});
//     }
//   })