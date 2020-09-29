const { Sequelize, DataTypes } = require('sequelize');
const { DATABASE, HOST, PORT, USERNAME, PASSWORD } = require('./config');
const moment = require('moment'); // require


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
        createModels(global.__sequalize);
        await global.__sequalize.sync({
            force: false
        });
        console.log('Database initialization ready...');
    }
    return global.__sequalize;
}

async function createModels(sequelize) {
    console.log('Models creation pending...');
    const User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fullname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: 0
        }
    }, { timestamps: false });

    const Product = sequelize.define('Product', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, { timestamps: false });

    const Order = sequelize.define('Order', {
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        time: {
            type: DataTypes.STRING,
            defaultValue: moment().format('DD MM YYYY hh:mm:ss')

        },
        paymentMethod: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, { timestamps: false });

    Order.belongsTo(User);
    User.hasMany(Order);
    await Order.belongsToMany(Product, { through: 'ProductOrders', timestamps: false });
    await Product.belongsToMany(Order, { through: 'ProductOrders', timestamps: false });

    console.log('Models creation ready...');
}

async function getDBModels() {
    const sequelize = await initDatabase();
    return sequelize.models;
}

module.exports = {
    initDatabase,
    getDBModels
}