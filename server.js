require('dotenv').config();
const express = require('express');
const { initDatabase } = require('./database');
const { errorHandler } = require('./middlewares/errorHandler');
const { router } = require('./routes/routes.js');
var cors = require('cors');
const helmet = require("helmet");
const PORT = 9091;

async function main() {
    const server = express();
    server.use(express.json());
    server.use(cors()); //Enable CORS Origin *
    server.use(helmet());
    server.use('/delilah/v1', router);
    server.use(errorHandler);

    const sequalize = await initDatabase();
    server.listen(PORT, () => {
        console.log(`Server is UP via port ${PORT}...`);
    });
}

main();