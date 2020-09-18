const { Sequelize, DataTypes } = require('sequelize');
const { DATABASE, HOST, PORT, USERNAME, PASSWORD } = require('./config');

async function initDatabase() {
    if (!global.__sequalize) {
        console.log('Database connection pending...');
        global.__sequalize = new Sequelize({
            username: USERNAME,
            database: DATABASE,
            password: PASSWORD,
            host: HOST,
            port: PORT,
            dialect: 'mariadb',
            logging: false,
        });
        console.log('Database connection ready...');
        //createModels(global.__sequalize);
        await global.__sequalize.sync({
            // force: true
        });
        console.log('Database initialization ready...');
    }
    return global.__sequalize;
}

//   function createModels (sequelize) {
//     console.log('Models creation pending...');
//     const Deportista = sequelize.define('Deportista', {
//       // Model attributes are defined here
//       nombre: {
//         type: DataTypes.STRING,
//         allowNull: false
//       },
//       apellido: {
//         type: DataTypes.STRING,
//         allowNull: false
//       },
//       pasaporte: {
//         type: DataTypes.STRING,
//         allowNull: false
//       }
//     }, {
//       // Other model options go here
//     });
//     const Pais = sequelize.define('Pais', {
//       // Model attributes are defined here
//       nombre: {
//         type: DataTypes.STRING(50),
//         allowNull: false
//       }
//     }, {
//       // Other model options go here
//     });
//     Deportista.belongsTo(Pais, { as: 'pais' });
//     console.log('Models creation ready...');
//   }

//   async function getModels() {
//     const sequelize = await initDatabase();
//     return sequelize.models;
//   }

module.exports = {
    initDatabase,
    //getModels
}