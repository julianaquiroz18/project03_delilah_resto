require('dotenv').config();
const express = require('express');
const { initDatabase } = require('./database');
const { router } = require('./routes/routes.js');
const PORT = 9091;

async function main() {
    const server = express();
    server.use(express.json());
    server.use('/delilah/v1', router);

    const sequalize = await initDatabase();
    server.listen(PORT, () => {
        console.log(`Server is UP via port ${PORT}...`);
    });
}

main();