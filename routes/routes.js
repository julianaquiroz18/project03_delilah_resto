const express = require('express');
const router = express.Router();
const { Op } = require("sequelize");
const { getModels, getUserInfo, checkUser, login, checkIfAdmin } = require('../middlewares/middlewares');
const { jwtGenerator, jwtExtract, verifyToken } = require('../middlewares/jwt');
const { registerSchema } = require('../schemas/schemas');

/**
 * Schema validator
 */
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
 * Create user
 */
router.post("/users", validate({ body: registerSchema }), getUserInfo, getModels, checkUser, async(req, res) => {
    const User = req.models.User;
    const newUser = await User.create(req.userInfo);
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
router.get("/users/:userID", getModels, jwtExtract, verifyToken, async(req, res) => {
    const User = req.models.User;
    if (req.userInfo.isAdmin) {
        try {
            const user = await User.findOne({
                where: { id: Number(req.params.userID) }
            });
            res.status(200).json(user);
        } catch (error) {
            res.status(404).send({
                code: 404,
                error: "Invalid user ID / User does not exist"
            });
        };
    };

    if (req.params.userID === "me") {
        const user = await User.findOne({
            where: { id: Number(req.userInfo.id) }
        });
        res.status(200).json(user);
    }
    res.status(404).send({
        code: 404,
        error: "Invalid URI"
    });
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