const express = require('express');
const router = express.Router();
const { Op } = require("sequelize");
const { getModels, getUserInfo, login } = require('../middlewares/middlewares');
const { registerSchema } = require('../schemas/schemas');

const { Validator } = require('express-json-validator-middleware');
const validator = new Validator({ allErrors: true });
const validate = validator.validate;

router.get("/users", getModels, async(req, res) => {
    const User = req.models.User;
    const userList = await User.findAll();
    res.status(200).json(userList);
});

router.post("/users", validate({ body: registerSchema }), getUserInfo, getModels, async(req, res) => {
    const User = req.models.User;
    const newUser = await User.create(req.userInfo);
    res.status(200).json(newUser);
});

router.get("/users/login", login, (req, res) => {
    res.status(200).json(req.userInfo);
});

router.get("/users/:userID", getModels, async(req, res) => {
    const User = req.models.User;
    const user = await User.findOne({
        where: { id: Number(req.params.userID) }
    });
    if (user === null) {
        res.status(404).end("Invalid user ID / User does not exist")
    } else {
        res.status(200).json(user);
    }
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